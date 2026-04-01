/* eslint-disable @typescript-eslint/no-unused-vars */
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { splitIntoChunks } from "@/lib/ai/chunking";
import { isDosenAllowedForSubjectInCurrentYear } from "@/lib/auth/dosen-access";
import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import {
  badRequest,
  forbidden,
  notFound,
  serverError,
  tooManyRequests,
  unauthorized,
} from "@/lib/core/http";
import { checkRateLimit, getClientIp } from "@/lib/core/limiter";
import {
  materialToChunkText,
  sanitizeMaterialInput,
} from "@/lib/utils/material-content";

type Context = {
  params: Promise<{ id: string }>;
};

const updateMaterialSchema = z.object({
  courseId: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(3).max(180).optional(),
  module: z.string().trim().min(2).max(120).optional(),
  page: z.string().trim().max(120).nullable().optional(),
  content: z.string().trim().min(50).max(200_000).optional(),
});

function getRateLimitGuard(request: Request, userId: string, scope: string) {
  return checkRateLimit({
    key: `${getClientIp(request)}:${userId}:${scope}`,
    limit: 60,
    windowMs: 60_000,
  });
}

function canManageMaterial(
  userRole: UserRole,
  userId: string,
  creatorId: string | null,
) {
  if (userRole === UserRole.admin) return true;
  if (userRole !== UserRole.dosen) return false;
  return creatorId === userId;
}

export async function GET(request: Request, context: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can view materials");
    }

    const { id } = await context.params;

    // Try CourseMaterial
    const material = await prisma.courseMaterial.findUnique({
      where: { id },
      include: {
        _count: { select: { chunks: true } },
        course: { select: { id: true, code: true, title: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (material) {
      if (!canManageMaterial(user.role, user.id, material.createdById)) {
        return forbidden("Anda tidak memiliki akses ke materi ini");
      }
      return NextResponse.json({ ...material, type: "reference" });
    }

    // Try SubjectMeeting
    const meeting = await prisma.subjectMeeting.findUnique({
      where: { id },
      include: {
        _count: { select: { chunks: true } },
        subject: { select: { id: true, code: true, name: true } },
      },
    });

    if (meeting) {
      if (user.role === UserRole.dosen) {
        const allowed = await isDosenAllowedForSubjectInCurrentYear({
          userId: user.id,
          role: user.role,
          subjectId: meeting.subjectId,
        });
        if (!allowed) {
          return forbidden("Anda tidak memiliki akses ke materi sesi ini");
        }
      }

      return NextResponse.json({
        ...meeting,
        type: "session",
        course: meeting.subject
          ? {
              id: meeting.subject.id,
              code: meeting.subject.code,
              title: meeting.subject.name,
            }
          : null,
      });
    }

    return notFound("Knowledge item not found");
  } catch (error) {
    return serverError(error, "KB_MATERIALS_ID_GET_ERROR");
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can update materials");
    }

    const { id } = await context.params;
    const body = await request.json();
    const type = body.type || "reference";

    const safeContent = sanitizeMaterialInput(body.content);
    const chunks = splitIntoChunks(materialToChunkText(safeContent));

    if (type === "session") {
      const meetingExists = await prisma.subjectMeeting.findUnique({
        where: { id },
        select: { subjectId: true },
      });
      if (!meetingExists) {
        return notFound("Session not found");
      }

      if (user.role === UserRole.dosen) {
        const allowed = await isDosenAllowedForSubjectInCurrentYear({
          userId: user.id,
          role: user.role,
          subjectId: meetingExists.subjectId,
        });
        if (!allowed) {
          return forbidden("Anda tidak memiliki akses kelola sesi ini");
        }
      }

      const meeting = await prisma.subjectMeeting.update({
        where: { id },
        data: {
          title: body.title,
          meetingNo: body.meetingNo,
          content: safeContent,
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
      return NextResponse.json({
        ...meeting,
        type: "session",
        course: {
          id: meeting.subject.id,
          code: meeting.subject.code,
          title: meeting.subject.name,
        },
      });
    } else {
      const existing = await prisma.courseMaterial.findUnique({
        where: { id },
      });
      if (!existing) return notFound("Material not found");

      if (!canManageMaterial(user.role, user.id, existing.createdById)) {
        return forbidden("Anda tidak memiliki akses kelola materi ini");
      }

      const material = await prisma.courseMaterial.update({
        where: { id },
        data: {
          courseId: body.courseId,
          title: body.title,
          module: body.module,
          page: body.page,
          content: safeContent,
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
          course: { select: { id: true, code: true, title: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
      return NextResponse.json({ ...material, type: "reference" });
    }
  } catch (error) {
    return serverError(error, "KB_MATERIALS_ID_PATCH_ERROR");
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can delete materials");
    }

    const { id } = await context.params;

    // Check Reference first
    const ref = await prisma.courseMaterial.findUnique({ where: { id } });
    if (ref) {
      if (!canManageMaterial(user.role, user.id, ref.createdById)) {
        return forbidden("Anda tidak memiliki akses kelola materi ini");
      }
      await prisma.courseMaterial.delete({ where: { id } });
      return NextResponse.json({ message: "Reference deleted" });
    }

    // Check Session
    const sess = await prisma.subjectMeeting.findUnique({ where: { id } });
    if (sess) {
      if (user.role === UserRole.dosen) {
        const allowed = await isDosenAllowedForSubjectInCurrentYear({
          userId: user.id,
          role: user.role,
          subjectId: sess.subjectId,
        });
        if (!allowed) {
          return forbidden("Anda tidak memiliki akses kelola sesi ini");
        }
      }

      await prisma.subjectMeeting.delete({ where: { id } });
      return NextResponse.json({ message: "Session deleted" });
    }

    return notFound("Knowledge item not found");
  } catch (error) {
    return serverError(error, "KB_MATERIALS_ID_DELETE_ERROR");
  }
}
