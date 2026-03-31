import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { forbidden, serverError, unauthorized } from "@/lib/core/http";
import { prisma } from "@/lib/core/db";

type RatedTurn = {
  rating: number | null;
};

type CitationTurn = {
  citations: unknown;
};

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can access chatbot stats");
    }

    const [
      totalMaterials,
      totalSessions,
      totalTurns,
      ratedTurns,
      fastTurns,
      citationTurns,
    ] = await Promise.all([
      prisma.subjectMeeting.count(),
      prisma.chatSession.count(),
      prisma.chatTurn.count(),
      prisma.chatTurn.findMany({
        where: { rating: { not: null } },
        select: { rating: true },
      }),
      prisma.chatTurn.count({ where: { responseTimeMs: { lt: 3000 } } }),
      prisma.chatTurn.findMany({ select: { citations: true } }),
    ]);

    const avgRating =
      ratedTurns.length > 0
        ? ratedTurns.reduce(
            (sum: number, item: RatedTurn) => sum + (item.rating ?? 0),
            0,
          ) / ratedTurns.length
        : null;

    const citedAnswers = citationTurns.filter((item: CitationTurn) => {
      if (!Array.isArray(item.citations)) return false;
      return item.citations.length > 0;
    }).length;

    const citationCoverage =
      totalTurns > 0
        ? Number(((citedAnswers / totalTurns) * 100).toFixed(2))
        : 0;

    const fastResponseRate =
      totalTurns > 0 ? Number(((fastTurns / totalTurns) * 100).toFixed(2)) : 0;

    return NextResponse.json({
      totalMaterials,
      totalSessions,
      totalTurns,
      avgRating: avgRating ? Number(avgRating.toFixed(2)) : null,
      ratedTurns: ratedTurns.length,
      citationCoverage,
      fastResponseRate,
      target: {
        answerRelevance: ">= 70%",
        citation: "Jawaban mencantumkan sumber materi",
        responseTime: "< 3 detik",
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
