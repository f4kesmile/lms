import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser, hasRole } from "@/lib/current-user";
import { forbidden, notFound, serverError, unauthorized } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.nativeEnum(UserRole).optional(),
  isActive: z.boolean().optional(),
  studentClassId: z.string().nullable().optional(),
});

const allowedRoles = [UserRole.admin, UserRole.dosen];

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) return unauthorized();
    if (!hasRole(currentUser.role, allowedRoles)) {
      return forbidden("User is not authorized to access this route");
    }

    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid user payload" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      return notFound("User not found");
    }

    const hashedPassword = parsed.data.password
      ? await bcrypt.hash(parsed.data.password, 10)
      : undefined;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        isActive: parsed.data.isActive,
        studentClassId: parsed.data.studentClassId,
        ...(hashedPassword ? { password: hashedPassword } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        studentClassId: true,
      },
    });

    return NextResponse.json({
      ...updated,
      message: "User updated successfully",
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) return unauthorized();
    if (!hasRole(currentUser.role, allowedRoles)) {
      return forbidden("User is not authorized to access this route");
    }

    const { id } = await context.params;
    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      return notFound("User not found");
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    return serverError(error);
  }
}
