"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/core/db";
import { splitIntoChunks } from "@/lib/ai/chunking";

export async function getSubjectMeetingsAction(subjectId: string) {
  try {
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

    const meeting = await prisma.subjectMeeting.findUnique({
      where: { id },
      select: { subjectId: true },
    });

    if (meeting) {
      revalidatePath(`/admin/courses/${meeting.subjectId}/meetings`);
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
