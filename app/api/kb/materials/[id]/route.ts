import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { badRequest, forbidden, notFound, serverError, unauthorized } from "@/lib/core/http";
import { prisma } from "@/lib/core/db";
import { splitIntoChunks } from "@/lib/ai/rag";

type Context = {
  params: Promise<{ id: string }>;
};

const updateMaterialSchema = z.object({
  courseId: z.string().uuid().nullable().optional(),
  title: z.string().min(3).optional(),
  module: z.string().min(2).optional(),
  page: z.string().nullable().optional(),
  content: z.string().min(50).optional(),
});

export async function GET(_request: Request, context: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

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
    return NextResponse.json(material);
  } catch (error) {
    return serverError(error);
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
    const parsed = updateMaterialSchema.safeParse(body);

    if (!parsed.success) return badRequest("Invalid material payload");

    const existing = await prisma.courseMaterial.findUnique({ where: { id } });
    if (!existing) return notFound("Material not found");

    if (parsed.data.courseId !== undefined && parsed.data.courseId !== null) {
      const exists = await prisma.course.findUnique({
        where: { id: parsed.data.courseId },
        select: { id: true },
      });
      if (!exists) {
        return badRequest("Course tidak ditemukan");
      }
    }

    const nextContent = parsed.data.content ?? existing.content;
    const chunks = splitIntoChunks(nextContent);
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
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can delete materials");
    }

    const { id } = await context.params;
    const existing = await prisma.courseMaterial.findUnique({ where: { id } });

    if (!existing) return notFound("Material not found");

    await prisma.courseMaterial.delete({ where: { id } });
    return NextResponse.json({ message: "Material deleted" });
  } catch (error) {
    return serverError(error);
  }
}
