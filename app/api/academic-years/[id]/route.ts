import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { badRequest, forbidden, notFound, serverError, unauthorized } from "@/lib/core/http";
import { prisma } from "@/lib/core/db";

const updateAcademicYearSchema = z.object({
  name: z.string().min(3).optional(),
  fromYear: z.coerce.date().optional(),
  toYear: z.coerce.date().optional(),
  isCurrent: z.boolean().optional(),
});

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (!hasRole(currentUser.role, [UserRole.admin])) {
      return forbidden("Only admin can update academic years");
    }

    const { id } = await context.params;
    const existing = await prisma.academicYear.findUnique({ where: { id } });
    if (!existing) return notFound("Academic Year not found");

    const body = await request.json();
    const parsed = updateAcademicYearSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid academic year payload");

    if (parsed.data.isCurrent) {
      await prisma.academicYear.updateMany({
        where: { id: { not: id } },
        data: { isCurrent: false },
      });
    }

    const updated = await prisma.academicYear.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (!hasRole(currentUser.role, [UserRole.admin])) {
      return forbidden("Only admin can delete academic years");
    }

    const { id } = await context.params;
    const existing = await prisma.academicYear.findUnique({ where: { id } });
    if (!existing) return notFound("Academic Year not found");

    if (existing.isCurrent) {
      return badRequest("Cannot delete the current academic year");
    }

    await prisma.academicYear.delete({ where: { id } });
    return NextResponse.json({ message: "Academic Year deleted successfully" });
  } catch (error) {
    return serverError(error);
  }
}
