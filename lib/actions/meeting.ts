"use server";

import { Prisma, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { splitIntoChunks } from "@/lib/ai/chunking";
import { getDosenSubjectAccessInCurrentYear } from "@/lib/auth/dosen-access";
import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";

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

  const access = await getDosenSubjectAccessInCurrentYear({
    userId: user.id,
    role: user.role,
    subjectId,
  });

  if (access.status === "assigned-to-other-dosen") {
    return {
      ok: false,
      message:
        "Mata kuliah ini memiliki pengampu kelas lain. Untuk saat ini hanya admin yang dapat mengelola sesi lintas pengampu.",
    };
  }

  if (access.allowed) {
    return { ok: true };
  }

  return {
    ok: false,
    message: "Anda tidak memiliki akses kelola sesi untuk mata kuliah ini",
  };
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

export async function getSubjectParticipantsAction(
  subjectId: string,
  classId?: string,
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Silakan login ulang" };
    }

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
        ...(classId ? { classId } : {}),
        ...(user.role === UserRole.dosen ? { teacherUserId: user.id } : {}),
      },
      select: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
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

    if (classId && classSubjects.length === 0) {
      return {
        success: false,
        error: "Anda tidak memiliki akses ke daftar mahasiswa kelas ini",
      };
    }

    const firstScope = classSubjects[0];

    return {
      success: true,
      yearName: currentYear.name,
      scope: {
        subjectId: firstScope?.subject.id || subjectId,
        subjectName: firstScope?.subject.name || "Mata Kuliah",
        subjectCode: firstScope?.subject.code || "-",
        classId: classId || null,
        className:
          classId && classSubjects.length > 0
            ? classSubjects[0].class.name
            : null,
      },
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
