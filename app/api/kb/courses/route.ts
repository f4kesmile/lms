import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { buildDosenCurrentYearSubjectWhere } from "@/lib/auth/dosen-access";
import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import { forbidden, serverError, unauthorized } from "@/lib/core/http";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can view subject options");
    }

    const subjects = await prisma.subject.findMany({
      where:
        user.role === UserRole.dosen
          ? {
              isActive: true,
              ...buildDosenCurrentYearSubjectWhere(user.id),
            }
          : { isActive: true },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        learningOutcomes: true,
        credits: true,
        bannerImage: true,
        status: true,
        updatedAt: true,
        teachers: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                nip: true,
                specialization: true,
              },
            },
          },
        },
        _count: {
          select: {
            meetings: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 200,
    });

    return NextResponse.json({ courses: subjects });
  } catch (error) {
    return serverError(error);
  }
}
