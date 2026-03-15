import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentUser, hasRole } from "@/lib/current-user";
import { forbidden, serverError, unauthorized } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type InteractionItem = {
  id: string;
  user: { name: string };
  query: string;
  response: string;
  status: string;
  createdAt: string;
  responseTimeMs: number;
  rating: number | null;
  citationCount: number;
};

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();
    if (!hasRole(currentUser.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Hanya admin atau dosen yang dapat melihat insight AI");
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || 20), 50);

    const turns = await prisma.chatTurn.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        question: true,
        answer: true,
        createdAt: true,
        responseTimeMs: true,
        rating: true,
        citations: true,
        user: { select: { name: true } },
      },
    });

    const totalTurns = await prisma.chatTurn.count();
    const ratedTurns = turns.filter((item) => item.rating !== null);
    const avgResponseTimeMs =
      turns.length > 0
        ? Math.round(
            turns.reduce((sum, item) => sum + item.responseTimeMs, 0) / turns.length,
          )
        : 0;
    const successTurns = turns.filter((item) => {
      const citations = Array.isArray(item.citations) ? item.citations.length : 0;
      return citations > 0 || (item.answer ?? "").trim().length > 0;
    }).length;
    const accuracyScore =
      turns.length > 0 ? Number(((successTurns / turns.length) * 100).toFixed(1)) : 0;

    const interactions: InteractionItem[] = turns.map((item) => ({
      id: item.id,
      user: { name: item.user.name },
      query: item.question,
      response: item.answer,
      status: item.rating && item.rating >= 4 ? "Memuaskan" : "Terekam",
      createdAt: item.createdAt.toISOString(),
      responseTimeMs: item.responseTimeMs,
      rating: item.rating,
      citationCount: Array.isArray(item.citations) ? item.citations.length : 0,
    }));

    return NextResponse.json({
      summary: {
        totalTurns,
        avgResponseTimeMs,
        accuracyScore,
        avgRating:
          ratedTurns.length > 0
            ? Number(
                (
                  ratedTurns.reduce((sum, item) => sum + (item.rating ?? 0), 0) /
                  ratedTurns.length
                ).toFixed(2),
              )
            : null,
      },
      interactions,
    });
  } catch (error) {
    return serverError(error);
  }
}
