import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { badRequest, forbidden, serverError, unauthorized } from "@/lib/core/http";
import { prisma } from "@/lib/core/db";
import { splitIntoChunks } from "@/lib/ai/rag";

const createMaterialSchema = z.object({
  courseId: z.string().uuid().optional(),
  title: z.string().min(3),
  module: z.string().min(2),
  page: z.string().optional(),
  content: z.string().min(50),
});

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const courseId = searchParams.get("courseId") ?? "";

    const materials = await prisma.courseMaterial.findMany({
      where: {
        ...(courseId.trim() ? { courseId: courseId.trim() } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { module: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { chunks: true } },
        course: { select: { id: true, code: true, title: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ materials });
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can manage knowledge base");
    }

    const body = await request.json();
    const parsed = createMaterialSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid material payload");

    const { courseId, title, module, page, content } = parsed.data;
    const chunks = splitIntoChunks(content);

    if (chunks.length === 0) {
      return badRequest("Material content is empty");
    }

    if (courseId) {
      const exists = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true },
      });
      if (!exists) {
        return badRequest("Course tidak ditemukan");
      }
    }

    const material = await prisma.courseMaterial.create({
      data: {
        courseId,
        title,
        module,
        page,
        content,
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
    return serverError(error);
  }
}
