import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import { notFound, serverError, unauthorized } from "@/lib/core/http";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();

    const currentYear = await prisma.academicYear.findFirst({
      where: { isCurrent: true },
      orderBy: { updatedAt: "desc" },
    });

    if (!currentYear) return notFound("No current academic year found");

    return NextResponse.json(currentYear);
  } catch (error) {
    return serverError(error);
  }
}
