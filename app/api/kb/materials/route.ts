import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, hasRole } from "@/lib/current-user";
import { badRequest, forbidden, serverError, unauthorized } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { splitIntoChunks } from "@/lib/rag";

const createMaterialSchema = z.object({
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

    const materials = await prisma.courseMaterial.findMany({
      where: search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { module: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { chunks: true } },
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

    const { title, module, page, content } = parsed.data;
    const chunks = splitIntoChunks(content);

    if (chunks.length === 0) {
      return badRequest("Material content is empty");
    }

    const material = await prisma.courseMaterial.create({
      data: {
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
      },
    });

    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
