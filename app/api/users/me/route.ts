import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/user";
import { unauthorized, serverError } from "@/lib/core/http";
import { prisma } from "@/lib/core/db";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorized("Not authorized");
    }

    const classLinks = await prisma.classStudent.findMany({
      where: { userId: currentUser.id },
      select: {
        classId: true,
        progress: true,
        class: {
          select: {
            id: true,
            name: true,
            subjects: {
              select: {
                subject: { select: { name: true, code: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      user: {
        ...currentUser,
        classLinks,
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
