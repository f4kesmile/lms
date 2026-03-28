import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { splitIntoChunks } from "@/lib/ai/chunking";
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

    const limitGuard = getRateLimitGuard(
      request,
      user.id,
      "kb-materials-id:get",
    );
    if (!limitGuard.allowed) {
      return tooManyRequests(
        "Terlalu banyak request. Coba lagi sebentar.",
        limitGuard.retryAfterMs / 1000,
      );
    }

    const { id } = await context.params;
    const material = await prisma.courseMaterial.findUnique({
      where: { id },
      include: {
        _count: { select: { chunks: true } },
        course: { select: { id: true, code: true, title: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!material) return notFound("Material not found");
    if (!canManageMaterial(user.role, user.id, material.createdById)) {
      return forbidden("Anda tidak memiliki akses ke materi ini");
    }

    return NextResponse.json(material);
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

    const limitGuard = getRateLimitGuard(
      request,
      user.id,
      "kb-materials-id:patch",
    );
    if (!limitGuard.allowed) {
      return tooManyRequests(
        "Terlalu banyak request. Coba lagi sebentar.",
        limitGuard.retryAfterMs / 1000,
      );
    }

    const { id } = await context.params;
    const existing = await prisma.courseMaterial.findUnique({ where: { id } });
    if (!existing) return notFound("Material not found");

    if (!canManageMaterial(user.role, user.id, existing.createdById)) {
      return forbidden("Anda tidak memiliki akses kelola materi ini");
    }

    const body = await request.json();
    const parsed = updateMaterialSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid material payload");

    const nextContent =
      parsed.data.content !== undefined
        ? sanitizeMaterialInput(parsed.data.content)
        : existing.content;

    const chunkSource = materialToChunkText(nextContent);
    const chunks = splitIntoChunks(chunkSource);

    if (chunks.length === 0) {
      return badRequest("Material content is empty");
    }

    const material = await prisma.courseMaterial.update({
      where: { id },
      data: {
        courseId: parsed.data.courseId,
        title: parsed.data.title,
        module: parsed.data.module,
        page: parsed.data.page,
        content: nextContent,
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

    return NextResponse.json(material);
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

    const limitGuard = getRateLimitGuard(
      request,
      user.id,
      "kb-materials-id:delete",
    );
    if (!limitGuard.allowed) {
      return tooManyRequests(
        "Terlalu banyak request. Coba lagi sebentar.",
        limitGuard.retryAfterMs / 1000,
      );
    }

    const { id } = await context.params;
    const existing = await prisma.courseMaterial.findUnique({ where: { id } });
    if (!existing) return notFound("Material not found");

    if (!canManageMaterial(user.role, user.id, existing.createdById)) {
      return forbidden("Anda tidak memiliki akses kelola materi ini");
    }

    await prisma.courseMaterial.delete({ where: { id } });
    return NextResponse.json({ message: "Material deleted" });
  } catch (error) {
    return serverError(error, "KB_MATERIALS_ID_DELETE_ERROR");
  }
}
