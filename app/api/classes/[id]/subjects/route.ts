import { NextResponse } from "next/server";
import { prisma } from "@/lib/core/db";
import { getCurrentUser } from "@/lib/auth/user";
import { unauthorized, notFound, serverError } from "@/lib/core/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
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
        id: s.id,
        subject: {
          id: s.subject.id,
          code: s.subject.code,
          name: s.subject.name,
        },
        teacher: s.teacher,
        dayOfWeek: (s as any).dayOfWeek,
        startTime: (s as any).startTime,
        endTime: (s as any).endTime,
        room: (s as any).room,
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}
