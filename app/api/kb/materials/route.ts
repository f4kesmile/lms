import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { splitIntoChunks } from "@/lib/ai/chunking";
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

    const limitGuard = getRateLimitGuard(request, user.id, "kb-materials:get");
    if (!limitGuard.allowed) {
      return tooManyRequests(
        "Terlalu banyak request. Coba lagi sebentar.",
        limitGuard.retryAfterMs / 1000,
      );
    }

    const { searchParams } = new URL(request.url);
    const search = toLimitedText(searchParams.get("search") ?? "");
    const courseId = (searchParams.get("courseId") ?? "").trim();

    const materials = await prisma.courseMaterial.findMany({
      where: {
        ...(user.role === UserRole.dosen ? { createdById: user.id } : {}),
        ...(courseId ? { courseId } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { module: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { chunks: true } },
        course: { select: { id: true, code: true, title: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
      take: 200,
    });

    return NextResponse.json({ materials });
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

    const limitGuard = getRateLimitGuard(request, user.id, "kb-materials:post");
    if (!limitGuard.allowed) {
      return tooManyRequests(
        "Terlalu banyak request. Coba lagi sebentar.",
        limitGuard.retryAfterMs / 1000,
      );
    }

    const body = await request.json();
    const parsed = createMaterialSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid material payload");

    const safeContent = sanitizeMaterialInput(parsed.data.content);
    const chunkSource = materialToChunkText(safeContent);
    const chunks = splitIntoChunks(chunkSource);

    if (chunks.length === 0) {
      return badRequest("Material content is empty");
    }

    const material = await prisma.courseMaterial.create({
      data: {
        courseId: parsed.data.courseId ?? null,
        title: parsed.data.title,
        module: parsed.data.module,
        page: parsed.data.page ?? null,
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

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    return serverError(error, "KB_MATERIALS_POST_ERROR");
  }
}
