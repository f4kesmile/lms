import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { splitIntoChunks } from "@/lib/ai/chunking";
import {
  isDosenAllowedForSubjectInCurrentYear,
  buildDosenCurrentYearSubjectWhere,
} from "@/lib/auth/dosen-access";
import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import {
  badRequest,
  forbidden,
  serverError,
  tooManyRequests,
  unauthorized,
} from "@/lib/core/http";
import { checkRateLimit, getClientIp } from "@/lib/core/limiter";
import {
  materialToChunkText,
  sanitizeMaterialInput,
} from "@/lib/utils/material-content";

const createMaterialSchema = z.object({
  courseId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(3).max(180),
  module: z.string().trim().min(2).max(120),
  page: z.string().trim().max(120).nullable().optional(),
  content: z.string().trim().min(50).max(200_000),
});

function toLimitedText(value: string) {
  return value.trim().slice(0, 160);
}

function getRateLimitGuard(request: Request, userId: string, scope: string) {
  return checkRateLimit({
    key: `${getClientIp(request)}:${userId}:${scope}`,
    limit: 60,
    windowMs: 60_000,
  });
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can view materials");
    }

    const { searchParams } = new URL(request.url);
    const search = toLimitedText(searchParams.get("search") ?? "");
    const courseId = (searchParams.get("courseId") ?? "").trim();

    // 1. Fetch Materials (References)
    const materials = await prisma.courseMaterial.findMany({
      where: {
        ...(user.role === UserRole.dosen ? { createdById: user.id } : {}),
        ...(courseId ? { courseId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { module: { contains: search, mode: "insensitive" } },
                { course: { code: { contains: search, mode: "insensitive" } } },
              ],
            }
          : {}),
      },
      orderBy: [{ updatedAt: "desc" }],
      include: {
        _count: { select: { chunks: true } },
        course: { select: { id: true, code: true, title: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    // 2. Fetch Meetings (Sessions)
    // Map Subject meetings to a similar material format
    const meetings = await prisma.subjectMeeting.findMany({
      where: {
        ...(user.role === UserRole.dosen
          ? { subject: buildDosenCurrentYearSubjectWhere(user.id) }
          : {}),
        ...(courseId ? { subjectId: courseId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                {
                  subject: { code: { contains: search, mode: "insensitive" } },
                },
              ],
            }
          : {}),
      },
      orderBy: [{ updatedAt: "desc" }],
      include: {
        _count: { select: { chunks: true } },
        subject: { select: { id: true, code: true, name: true } },
      },
    });

    // 3. Unify the results
    const unified = [
      ...materials.map((m) => ({
        ...m,
        type: "reference",
        course: m.course ? { ...m.course, name: m.course.title } : null,
      })),
      ...meetings.map((m) => ({
        ...m,
        type: "session",
        module: `Pertemuan ${m.meetingNo}`,
        course: m.subject
          ? { id: m.subject.id, code: m.subject.code, title: m.subject.name }
          : null,
        page: null,
      })),
    ].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    return NextResponse.json({ materials: unified });
  } catch (error) {
    return serverError(error, "KB_MATERIALS_GET_ERROR");
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can manage materials");
    }

    const body = await request.json();
    const type = body.type || "reference";
    const courseId = body.courseId;

    const safeContent = sanitizeMaterialInput(body.content);
    const chunks = splitIntoChunks(materialToChunkText(safeContent));

    if (chunks.length === 0) {
      return badRequest("Content is empty");
    }

    if (type === "session") {
      if (!courseId) {
        return badRequest("Mata kuliah sesi wajib dipilih");
      }

      if (user.role === UserRole.dosen) {
        const allowed = await isDosenAllowedForSubjectInCurrentYear({
          userId: user.id,
          role: user.role,
          subjectId: courseId,
        });
        if (!allowed) {
          return forbidden(
            "Dosen hanya dapat menambah sesi pada mata kuliah yang diampu",
          );
        }
      }

      const meeting = await prisma.subjectMeeting.create({
        data: {
          subjectId: courseId,
          meetingNo: body.meetingNo || 1,
          title: body.title,
          content: safeContent,
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
      return NextResponse.json(
        {
          ...meeting,
          type: "session",
          course: {
            id: meeting.subject.id,
            code: meeting.subject.code,
            title: meeting.subject.name,
          },
        },
        { status: 201 },
      );
    } else {
      const material = await prisma.courseMaterial.create({
        data: {
          courseId: courseId,
          title: body.title,
          module: body.module || "Umum",
          page: body.page || "1",
          content: safeContent,
          createdById: user.id,
          chunks: {
            create: chunks.map((chunk, index) => ({
              content: chunk,
              chunkIndex: index,
            })),
          },
        },
        include: {
          _count: { select: { chunks: true } },
          course: { select: { id: true, code: true, title: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
      return NextResponse.json(
        { ...material, type: "reference" },
        { status: 201 },
      );
    }
  } catch (error) {
    return serverError(error, "KB_MATERIALS_POST_ERROR");
  }
}
