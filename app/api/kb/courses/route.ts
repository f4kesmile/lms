import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentUser, hasRole } from "@/lib/current-user";
import { forbidden, serverError, unauthorized } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can view course options");
    }

    const courses = await prisma.course.findMany({
      where: user.role === UserRole.dosen ? { createdById: user.id } : undefined,
      select: {
        id: true,
        code: true,
        title: true,
        status: true,
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 200,
    });

    return NextResponse.json({ courses });
  } catch (error) {
    return serverError(error);
  }
}
