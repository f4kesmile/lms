import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { splitIntoChunks } from "@/lib/ai/rag";
import { isDosenAllowedForSubjectInCurrentYear } from "@/lib/auth/dosen-access";
import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import {
  badRequest,
  forbidden,
  notFound,
  serverError,
  unauthorized,
} from "@/lib/core/http";

type Context = {
  params: Promise<{ id: string }>;
};

const updateMeetingSchema = z.object({
  meetingNo: z.number().int().min(1).optional(),
  title: z.string().min(3).optional(),
  content: z.string().min(50).optional(),
  assets: z
    .array(
      z.object({
        name: z.string(),
        data: z.string(),
      }),
    )
    .nullable()
    .optional(),
});

export async function GET(_request: Request, context: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await context.params;
    const meeting = await prisma.subjectMeeting.findUnique({
      where: { id },
      include: {
        _count: { select: { chunks: true } },
        subject: { select: { id: true, code: true, name: true } },
      },
    });

    if (!meeting) return notFound("Meeting not found");
    if (
      !(await isDosenAllowedForSubjectInCurrentYear({
        userId: user.id,
        role: user.role,
        subjectId: meeting.subject.id,
      }))
    ) {
      return forbidden("Anda tidak memiliki akses ke sesi mata kuliah ini");
    }
    return NextResponse.json(meeting);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can update meetings");
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateMeetingSchema.safeParse(body);

    if (!parsed.success) return badRequest("Invalid meeting payload");

    const existing = await prisma.subjectMeeting.findUnique({ where: { id } });
    if (!existing) return notFound("Meeting not found");

    if (
      !(await isDosenAllowedForSubjectInCurrentYear({
        userId: user.id,
        role: user.role,
        subjectId: existing.subjectId,
      }))
    ) {
      return forbidden(
        "Anda tidak memiliki akses kelola sesi untuk mata kuliah ini",
      );
    }

    const nextContent = parsed.data.content ?? existing.content;
    const chunks = splitIntoChunks(nextContent);
    if (chunks.length === 0) return badRequest("Konten materi kosong");

    const meeting = await prisma.subjectMeeting.update({
      where: { id },
      data: {
        meetingNo: parsed.data.meetingNo,
        title: parsed.data.title,
        content: nextContent,
        assets:
          parsed.data.assets !== undefined
            ? (parsed.data.assets ?? [])
            : undefined,
        chunks: {
          deleteMany: {},
          create: chunks.map((chunk, index) => ({
            content: chunk,
            chunkIndex: index,
          })),
        },
      },
      include: {
        _count: { select: { chunks: true } },
        subject: { select: { id: true, code: true, name: true } },
      },
    });

    return NextResponse.json(meeting);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can delete meetings");
    }

    const { id } = await context.params;
    const existing = await prisma.subjectMeeting.findUnique({ where: { id } });

    if (!existing) return notFound("Meeting not found");

    if (
      !(await isDosenAllowedForSubjectInCurrentYear({
        userId: user.id,
        role: user.role,
        subjectId: existing.subjectId,
      }))
    ) {
      return forbidden(
        "Anda tidak memiliki akses kelola sesi untuk mata kuliah ini",
      );
    }

    await prisma.subjectMeeting.delete({ where: { id } });
    return NextResponse.json({ message: "Meeting deleted" });
  } catch (error) {
    return serverError(error);
  }
}
