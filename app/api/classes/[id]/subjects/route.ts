import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import { notFound, serverError, unauthorized } from "@/lib/core/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await params;

    const item = await prisma.class.findUnique({
      where: { id },
      include: {
        subjects: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
            teacher: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!item) return notFound("Kelas tidak ditemukan");

    return NextResponse.json({
      subjects: item.subjects.map((s) => ({
        id: s.subjectId,
        subject: {
          id: s.subject.id,
          code: s.subject.code,
          name: s.subject.name,
        },
        teacher: s.teacher,
        dayOfWeek: s.dayOfWeek,
        startTime: s.startTime,
        endTime: s.endTime,
        room: s.room,
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}
