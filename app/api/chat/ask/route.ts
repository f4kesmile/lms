import { NextResponse } from "next/server";
import { z } from "zod";

import { generateChatAnswer } from "@/lib/chatbot";
import { getCurrentUser } from "@/lib/current-user";
import { badRequest, serverError, unauthorized } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { buildSources, rankChunks } from "@/lib/rag";

const askSchema = z.object({
  question: z.string().min(5),
  sessionId: z.string().optional(),
  topK: z.number().int().min(1).max(8).optional(),
});

export async function POST(request: Request) {
  const startedAt = Date.now();

  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await request.json();
    const parsed = askSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid question payload");

    const { question, topK = 4 } = parsed.data;

    const chunks = await prisma.materialChunk.findMany({
      include: {
        material: {
          select: {
            id: true,
            title: true,
            module: true,
            page: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 600,
    });

    const ranked = rankChunks(question, chunks, topK);
    const sources = buildSources(ranked);

    if (sources.length === 0) {
      return NextResponse.json(
        {
          answer:
            "Maaf, saya belum menemukan materi yang cukup relevan. Silakan unggah materi atau perjelas pertanyaan.",
          sources: [],
        },
        { status: 200 }
      );
    }

    const answer = await generateChatAnswer({ question, sources });

    let sessionId = parsed.data.sessionId;
    if (sessionId) {
      const existing = await prisma.chatSession.findFirst({
        where: { id: sessionId, userId: user.id },
      });
      if (!existing) sessionId = undefined;
    }

    if (!sessionId) {
      const created = await prisma.chatSession.create({
        data: {
          userId: user.id,
          title: question.slice(0, 60),
        },
      });
      sessionId = created.id;
    }

    const responseTimeMs = Date.now() - startedAt;

    const turn = await prisma.chatTurn.create({
      data: {
        sessionId,
        userId: user.id,
        question,
        answer,
        citations: sources,
        responseTimeMs,
      },
    });

    return NextResponse.json({
      sessionId,
      turnId: turn.id,
      question,
      answer,
      sources,
      responseTimeMs,
    });
  } catch (error) {
    return serverError(error);
  }
}
