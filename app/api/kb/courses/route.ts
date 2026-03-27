import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { forbidden, serverError, unauthorized } from "@/lib/core/http";
import { prisma } from "@/lib/core/db";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can view subject options");
    }

    const subjects = await prisma.subject.findMany({
      where: user.role === UserRole.dosen
        ? { teachers: { some: { userId: user.id } } }
        : { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        learningOutcomes: true,
        credits: true,
        status: true,
        updatedAt: true,
        _count: {
          select: {
            meetings: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 200,
    });

    return NextResponse.json({ subjects });
  } catch (error) {
    return serverError(error);
  }
}
