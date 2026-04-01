import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import { badRequest, forbidden, notFound, serverError, unauthorized } from "@/lib/core/http";

const updateSubjectSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  teacherIds: z.array(z.string()).optional(),
  teacher: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (!hasRole(currentUser.role, [UserRole.admin])) {
      return forbidden("Only admin can update subjects");
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateSubjectSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid subject payload");

    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) return notFound("Subject not found");

    const resolvedTeacherIds = parsed.data.teacherIds ?? parsed.data.teacher;

    const updatedSubject = await prisma.subject.update({
      where: { id },
      data: {
        name: parsed.data.name,
        code: parsed.data.code,
        isActive: parsed.data.isActive,
        ...(resolvedTeacherIds
          ? {
              teachers: {
                deleteMany: {},
                create: resolvedTeacherIds.map((userId) => ({
                  user: { connect: { id: userId } },
                })),
              },
            }
          : {}),
      },
      include: {
        teachers: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
        },
      },
    });

    return NextResponse.json(updatedSubject);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (!hasRole(currentUser.role, [UserRole.admin])) {
      return forbidden("Only admin can delete subjects");
    }

    const { id } = await context.params;
    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) return notFound("Subject not found");

    await prisma.subject.delete({ where: { id } });
    return NextResponse.json({ message: "Subject deleted successfully" });
  } catch (error) {
    return serverError(error);
  }
}
