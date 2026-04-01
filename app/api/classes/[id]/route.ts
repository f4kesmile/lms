import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import {
  badRequest,
  forbidden,
  notFound,
  serverError,
  unauthorized,
} from "@/lib/core/http";

const updateClassSchema = z.object({
  name: z.string().min(2).optional(),
  academicYearId: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  enrollmentKey: z.string().trim().min(1).optional().nullable(),
  subjectIds: z.array(z.string()).optional(),
  studentIds: z.array(z.string()).optional(),
});

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (
      !hasRole(currentUser.role, [
        UserRole.admin,
        UserRole.dosen,
        UserRole.mahasiswa,
      ])
    ) {
      return forbidden("User is not authorized to access this route");
    }

    const { id } = await context.params;
    const item = await prisma.class.findUnique({
      where: { id },
      include: {
        academicYear: { select: { id: true, name: true } },
        subjects: {
          include: {
            subject: { select: { id: true, name: true, code: true } },
            teacher: { select: { id: true, name: true } },
          },
        },
        students: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!item) return notFound("Class not found");

    return NextResponse.json(item);
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (!hasRole(currentUser.role, [UserRole.admin])) {
      return forbidden("Only admin can update classes");
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateClassSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid class payload");

    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) return notFound("Class not found");

    const {
      name,
      academicYearId,
      capacity,
      enrollmentKey,
      subjectIds,
      studentIds,
    } = parsed.data;

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name,
        academicYearId,
        capacity,
        ...(enrollmentKey !== undefined
          ? { enrollmentKey: enrollmentKey?.trim() || null }
          : {}),
        ...(subjectIds
          ? {
              subjects: {
                deleteMany: {},
                create: subjectIds.map((subjectId: string) => ({
                  subject: { connect: { id: subjectId } },
                })),
              },
            }
          : {}),
        ...(studentIds
          ? {
              students: {
                deleteMany: {},
                create: studentIds.map((userId: string) => ({
                  user: { connect: { id: userId } },
                })),
              },
            }
          : {}),
      },
      include: {
        academicYear: { select: { id: true, name: true } },
        subjects: { include: { subject: true } },
        students: { include: { user: true } },
      },
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (!hasRole(currentUser.role, [UserRole.admin])) {
      return forbidden("Only admin can delete classes");
    }

    const { id } = await context.params;
    const existing = await prisma.class.findUnique({ where: { id } });
    if (!existing) return notFound("Class not found");

    await prisma.class.delete({ where: { id } });
    return NextResponse.json({ message: "Class removed" });
  } catch (error) {
    return serverError(error);
  }
}
