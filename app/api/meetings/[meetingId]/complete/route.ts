import { NextResponse } from "next/server";

import { getCurrentUserIdFromCookie } from "@/lib/auth";
import { prisma } from "@/lib/core/db";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ meetingId: string }> },
) {
  try {
    const completionDelegate = (
      prisma as unknown as {
        subjectMeetingCompletion?: {
          findUnique: (args: unknown) => Promise<unknown>;
          create: (args: unknown) => Promise<unknown>;
          count: (args: unknown) => Promise<number>;
        };
      }
    ).subjectMeetingCompletion;

    if (!completionDelegate) {
      return NextResponse.json(
        {
          message:
            "Fitur progress belum sinkron. Jalankan prisma generate lalu restart server.",
        },
        { status: 503 },
      );
    }

    const userId = await getCurrentUserIdFromCookie();
    if (!userId) {
      return NextResponse.json(
        { message: "Harap login terlebih dahulu" },
        { status: 401 },
      );
    }

    const { meetingId } = await ctx.params;
    const { classId, subjectId } = await req.json();

    if (!classId || !subjectId) {
      return NextResponse.json(
        { message: "classId dan subjectId wajib diisi" },
        { status: 400 },
      );
    }

    const meeting = await prisma.subjectMeeting.findUnique({
      where: { id: meetingId },
      select: { id: true, subjectId: true },
    });

    if (!meeting || meeting.subjectId !== subjectId) {
      return NextResponse.json(
        { message: "Sesi tidak ditemukan" },
        { status: 404 },
      );
    }

    const enrollment = await prisma.classStudent.findUnique({
      where: { classId_userId: { classId, userId } },
      select: { classId: true, userId: true },
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: "Anda belum terdaftar pada kelas ini" },
        { status: 403 },
      );
    }

    const classSubject = await prisma.classSubject.findUnique({
      where: { classId_subjectId: { classId, subjectId } },
      select: { classId: true },
    });

    if (!classSubject) {
      return NextResponse.json(
        { message: "Mata kuliah tidak terdaftar di kelas ini" },
        { status: 403 },
      );
    }

    const existingCompletion = await completionDelegate.findUnique({
      where: {
        meetingId_classId_userId: {
          meetingId,
          classId,
          userId,
        },
      },
      select: { meetingId: true },
    });

    if (!existingCompletion) {
      await completionDelegate.create({
        data: {
          meetingId,
          classId,
          userId,
        },
      });
    }

    const [totalMeetings, completedMeetings] = await Promise.all([
      prisma.subjectMeeting.count({ where: { subjectId } }),
      completionDelegate.count({
        where: {
          classId,
          userId,
          meeting: { subjectId },
        },
      }),
    ]);

    const progress =
      totalMeetings > 0
        ? Math.round((completedMeetings / totalMeetings) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      completed: true,
      progress,
      completedMeetings,
      totalMeetings,
    });
  } catch (error) {
    console.error("Complete meeting error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
