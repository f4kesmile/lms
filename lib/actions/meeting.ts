"use server";

import { revalidatePath } from "next/cache";
import { Prisma, UserRole } from "@prisma/client";
import { prisma } from "@/lib/core/db";
import { splitIntoChunks } from "@/lib/ai/chunking";
import { getCurrentUser } from "@/lib/auth/user";

async function canManageSubjectMeetings(subjectId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, message: "Silakan login ulang" };
  }

  if (user.role === UserRole.admin) {
    return { ok: true };
  }

  if (user.role !== UserRole.dosen) {
    return { ok: false, message: "Akses ditolak" };
  }

  const currentYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true },
    select: { id: true },
    orderBy: { updatedAt: "desc" },
  });

  const fallbackLink = await prisma.subjectTeacher.findUnique({
    where: {
      subjectId_userId: {
        subjectId,
        userId: user.id,
      },
    },
    select: { userId: true },
  });

  if (!currentYear) {
    return fallbackLink
      ? { ok: true }
      : { ok: false, message: "Anda bukan pengampu mata kuliah ini" };
  }

  const classSubjects = await prisma.classSubject.findMany({
    where: {
      subjectId,
      class: { academicYearId: currentYear.id },
    },
    select: { teacherUserId: true },
  });

  if (classSubjects.length === 0) {
    return fallbackLink
      ? { ok: true }
      : { ok: false, message: "Anda bukan pengampu mata kuliah ini" };
  }

  const assignedToOther = classSubjects.some(
    (row) => row.teacherUserId && row.teacherUserId !== user.id,
  );
  if (assignedToOther) {
    return {
      ok: false,
      message:
        "Mata kuliah ini memiliki pengampu kelas lain. Untuk saat ini hanya admin yang dapat mengelola sesi lintas pengampu.",
    };
  }

  const assignedToCurrent = classSubjects.some((row) => row.teacherUserId === user.id);
  const allUnassigned = classSubjects.every((row) => row.teacherUserId === null);

  if (assignedToCurrent || (allUnassigned && fallbackLink)) {
    return { ok: true };
  }

  return { ok: false, message: "Anda tidak memiliki akses kelola sesi untuk mata kuliah ini" };
}

export async function getSubjectMeetingsAction(subjectId: string) {
  try {
    const access = await canManageSubjectMeetings(subjectId);
    if (!access.ok) {
      return { success: false, error: access.message };
    }

    const meetings = await prisma.subjectMeeting.findMany({
      where: { subjectId },
      orderBy: { meetingNo: "asc" },
    });
    return { success: true, meetings };
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return { success: false, error: "Gagal mengambil data pertemuan" };
  }
}

export async function createSubjectMeetingAction(data: {
  subjectId: string;
  meetingNo: number;
  title: string;
  content: string;
  assets?: Prisma.InputJsonValue; 
}) {
  try {
    const access = await canManageSubjectMeetings(data.subjectId);
    if (!access.ok) {
      return { success: false, error: access.message };
    }

    const chunks = splitIntoChunks(data.content);

    await prisma.subjectMeeting.create({
      data: {
        subjectId: data.subjectId,
        meetingNo: data.meetingNo,
        title: data.title,
        content: data.content,
        assets: data.assets || {},
        chunks: {
          create: chunks.map((c, i) => ({
            chunkIndex: i,
            content: c,
          })),
        },
      },
    });

    revalidatePath(`/admin/courses/${data.subjectId}/meetings`);
    return { success: true };
  } catch (error) {
    console.error("Error creating meeting:", error);
    return { success: false, error: "Gagal membuat pertemuan" };
  }
}

export async function updateSubjectMeetingAction(
  id: string,
  data: {
    title: string;
    content: string;
    meetingNo: number;
    assets?: Prisma.InputJsonValue;
  },
) {
  try {
    const meeting = await prisma.subjectMeeting.findUnique({
      where: { id },
      select: { subjectId: true },
    });

    if (!meeting) {
      return { success: false, error: "Pertemuan tidak ditemukan" };
    }

    const access = await canManageSubjectMeetings(meeting.subjectId);
    if (!access.ok) {
      return { success: false, error: access.message };
    }

    const chunks = splitIntoChunks(data.content);

    await prisma.$transaction([
      // Delete old chunks
      prisma.meetingChunk.deleteMany({ where: { meetingId: id } }),
      // Update meeting and create new chunks
      prisma.subjectMeeting.update({
        where: { id },
        data: {
          title: data.title,
          content: data.content,
          meetingNo: data.meetingNo,
          assets: data.assets || {},
          chunks: {
            create: chunks.map((c, i) => ({
              chunkIndex: i,
              content: c,
            })),
          },
        },
      }),
    ]);

    const updatedMeeting = await prisma.subjectMeeting.findUnique({
      where: { id },
      select: { subjectId: true },
    });

    if (updatedMeeting) {
      revalidatePath(`/admin/courses/${updatedMeeting.subjectId}/meetings`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error updating meeting:", error);
    return { success: false, error: "Gagal memperbarui pertemuan" };
  }
}

export async function deleteSubjectMeetingAction(id: string) {
  try {
    const meeting = await prisma.subjectMeeting.findUnique({
      where: { id },
      select: { subjectId: true },
    });

    if (!meeting) {
      return { success: false, error: "Pertemuan tidak ditemukan" };
    }

    const access = await canManageSubjectMeetings(meeting.subjectId);
    if (!access.ok) {
      return { success: false, error: access.message };
    }

    await prisma.subjectMeeting.delete({ where: { id } });

    if (meeting) {
      revalidatePath(`/admin/courses/${meeting.subjectId}/meetings`);
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting meeting:", error);
    return { success: false, error: "Gagal menghapus pertemuan" };
  }
}

export async function getSubjectParticipantsAction(subjectId: string) {
  try {
    const access = await canManageSubjectMeetings(subjectId);
    if (!access.ok) {
      return { success: false, error: access.message };
    }

    const currentYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
      select: { id: true, name: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!currentYear) {
      return { success: true, classes: [] };
    }

    const classSubjects = await prisma.classSubject.findMany({
      where: {
        subjectId,
        class: { academicYearId: currentYear.id },
      },
      select: {
        class: {
          select: {
            id: true,
            name: true,
            students: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    nip: true,
                  },
                },
                progress: true,
              },
              orderBy: {
                user: {
                  name: "asc",
                },
              },
            },
          },
        },
      },
      orderBy: {
        class: {
          name: "asc",
        },
      },
    });

    return {
      success: true,
      yearName: currentYear.name,
      classes: classSubjects.map((row) => ({
        id: row.class.id,
        name: row.class.name,
        students: row.class.students.map((student) => ({
          id: student.user.id,
          name: student.user.name,
          email: student.user.email,
          identifier: student.user.nip,
          progress: student.progress,
        })),
      })),
    };
  } catch (error) {
    console.error("Error fetching participants:", error);
    return { success: false, error: "Gagal mengambil daftar mahasiswa" };
  }
}
