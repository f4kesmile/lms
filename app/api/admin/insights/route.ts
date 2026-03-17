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
    const page = Math.max(Number(searchParams.get("page") || 1), 1);
    const limit = Math.max(Number(searchParams.get("limit") || 10), 1);
    const search = searchParams.get("search")?.trim() || "";
    const skip = (page - 1) * limit;

    // CockroachDB via pg-adapter supports ILIKE via mode:"insensitive", but
    // to be safe we pass the lowercased term and match against lowercased fields.
    // Prisma does not expose SQL functions directly, so we use a raw-safe
    // contains without mode and lowercase the search term instead so results
    // remain useful even if the DB falls back to case-sensitive.
    const q = search.toLowerCase();
    const where = q
      ? {
          OR: [
            { question: { contains: q } },
            { answer: { contains: q } },
            { user: { name: { contains: search } } },
          ],
        }
      : undefined;

    const [turns, totalTurns, filteredTotal] = await Promise.all([
      prisma.chatTurn.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: skip,
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
      }),
      prisma.chatTurn.count(),
      prisma.chatTurn.count({ where }),
    ]);

    const ratedTurnsCount = await prisma.chatTurn.count({
      where: { rating: { not: null } }
    });
    
    // Summary metrics based on ALL data for accurate dashboarding
    // But for performance, we might want to aggregate this differently if data grows huge
    const summaryData = await prisma.chatTurn.aggregate({
      _avg: {
        responseTimeMs: true,
        rating: true,
      },
    });

    const successTurnsCount = await prisma.chatTurn.count({
      where: {
        OR: [
          { citations: { not: [] } },
          { answer: { not: "" } }
        ]
      }
    });

    const accuracyScore = totalTurns > 0 ? Number(((successTurnsCount / totalTurns) * 100).toFixed(1)) : 0;

    const interactions: InteractionItem[] = turns.map((item) => ({
      id: item.id,
      user: { name: item.user.name },
      query: item.question,
      response: item.answer,
      status:
        item.rating === null
          ? "Belum Dinilai"
          : item.rating >= 4
            ? "Memuaskan"
            : "Cukup",
      createdAt: item.createdAt.toISOString(),
      responseTimeMs: item.responseTimeMs,
      rating: item.rating,
      citationCount: Array.isArray(item.citations) ? item.citations.length : 0,
    }));

    return NextResponse.json({
      summary: {
        totalTurns,
        avgResponseTimeMs: Math.round(summaryData._avg.responseTimeMs || 0),
        accuracyScore,
        avgRating: summaryData._avg.rating ? Number(summaryData._avg.rating.toFixed(2)) : null,
      },
      interactions,
      pagination: {
        total: filteredTotal,
        pages: Math.ceil(filteredTotal / limit),
        currentPage: page,
        limit: limit,
      }
    });
  } catch (error) {
    return serverError(error);
  }
}
