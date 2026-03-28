import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { badRequest, forbidden, serverError, unauthorized } from "@/lib/core/http";
import { prisma } from "@/lib/core/db";
import { splitIntoChunks } from "@/lib/ai/rag";

async function canManageSubjectMeetings(userId: string, role: UserRole, subjectId: string) {
  if (role === UserRole.admin) return true;
  if (role !== UserRole.dosen) return false;

  const currentYear = await prisma.academicYear.findFirst({
    where: { isCurrent: true },
    select: { id: true },
    orderBy: { updatedAt: "desc" },
  });

  const fallbackLink = await prisma.subjectTeacher.findUnique({
    where: { subjectId_userId: { subjectId, userId } },
    select: { userId: true },
  });

  if (!currentYear) return Boolean(fallbackLink);

  const classSubjects = await prisma.classSubject.findMany({
    where: {
      subjectId,
      class: { academicYearId: currentYear.id },
    },
    select: { teacherUserId: true },
  });

  if (classSubjects.length === 0) return Boolean(fallbackLink);

  if (classSubjects.some((row) => row.teacherUserId && row.teacherUserId !== userId)) {
    return false;
  }

  if (classSubjects.some((row) => row.teacherUserId === userId)) {
    return true;
  }

  return classSubjects.every((row) => row.teacherUserId === null) && Boolean(fallbackLink);
}

const createMeetingSchema = z.object({
  subjectId: z.string().uuid(),
  meetingNo: z.number().int().min(1),
  title: z.string().min(3),
  content: z.string().min(50),
  assets: z.array(z.object({
    name: z.string(),
    data: z.string(),
  })).optional(),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can view meetings");
    }

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId") ?? "";
    const search = searchParams.get("search") ?? "";

    if (subjectId.trim() && !(await canManageSubjectMeetings(user.id, user.role, subjectId.trim()))) {
      return forbidden("Anda tidak memiliki akses ke sesi mata kuliah ini");
    }

    const meetings = await prisma.subjectMeeting.findMany({
      where: {
        ...(subjectId.trim() ? { subjectId: subjectId.trim() } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { content: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ meetingNo: "asc" }],
      include: {
        _count: { select: { chunks: true } },
        subject: { select: { id: true, code: true, name: true } },
      },
    });

    return NextResponse.json({ meetings });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can manage meetings");
    }

    const body = await request.json();
    const parsed = createMeetingSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid meeting payload");

    const { subjectId, meetingNo, title, content, assets } = parsed.data;

    if (!(await canManageSubjectMeetings(user.id, user.role, subjectId))) {
      return forbidden("Anda tidak memiliki akses kelola sesi untuk mata kuliah ini");
    }

    const subjectExists = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true },
    });
    if (!subjectExists) return badRequest("Subject tidak ditemukan");

    const chunks = splitIntoChunks(content);
    if (chunks.length === 0) return badRequest("Konten materi kosong");

    const meeting = await prisma.subjectMeeting.create({
      data: {
        subjectId,
        meetingNo,
        title,
        content,
        assets: assets ?? [],
        chunks: {
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

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
