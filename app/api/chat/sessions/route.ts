import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import { serverError, unauthorized } from "@/lib/core/http";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const sessions = await prisma.chatSession.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        _count: { select: { turns: true } },
      },
    });

    return NextResponse.json({
      sessions: sessions.map((session) => ({
        id: session.id,
        title: session.title || "Percakapan",
        updatedAt: session.updatedAt,
        totalTurns: session._count.turns,
      })),
    });
  } catch (error) {
    return serverError(error);
  }
}
