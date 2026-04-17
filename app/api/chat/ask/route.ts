import { NextResponse } from "next/server";
import { z } from "zod";

import { generateChatAnswer, isConversational, handleConversational } from "@/lib/ai/chatbot";
import type { ChunkWithMeeting } from "@/lib/ai/rag";
import { buildSources, rankChunks } from "@/lib/ai/rag";
import { readChatbotSettings } from "@/lib/ai/settings";
import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import { badRequest, serverError, unauthorized } from "@/lib/core/http";

function dedupeByMeeting<T extends { chunk: { meetingId: string } }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.chunk.meetingId)) return false;
    seen.add(item.chunk.meetingId);
    return true;
  });
}

const askSchema = z.object({
  question: z.string().min(1),
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

    const settings = await readChatbotSettings();
    const { question, topK = settings.topK } = parsed.data;
    const isConv = isConversational(question);
    const candidatePool = Math.min(40, Math.max(topK * 4, 12));

    const chunks: ChunkWithMeeting[] = await prisma.meetingChunk.findMany({
      select: {
        id: true,
        meetingId: true,
        chunkIndex: true,
        content: true,
        createdAt: true,
        meeting: {
          select: {
            id: true,
            title: true,
            meetingNo: true,
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    const ranked = rankChunks(question, chunks, candidatePool, 0);
    const strictRanked = dedupeByMeeting(
      ranked.filter((item) => item.score >= settings.minScore),
    ).slice(0, topK);

    const nearestRanked = dedupeByMeeting(ranked).slice(0, 5);

    const sources = buildSources(strictRanked);
    const nearestSources =
      sources.length === 0 ? buildSources(nearestRanked) : [];

    let answer = "";
    let citationsToSave: typeof sources = [];
    
    if (isConv) {
      answer = handleConversational(question);
    } else if (sources.length > 0) {
      answer = await generateChatAnswer({ question, sources });
      citationsToSave = sources;
    } else if (nearestSources.length > 0) {
      answer = [
        "Maaf ya, Liona belum menemukan pedoman yang persis untuk menjawab pertanyaan tersebut.",
        "",
        "Tapi materi terdekat yang mungkin ada hubungannya adalah:",
        ...nearestSources.slice(0, 3).map((item) =>
          `- ${item.title} (${item.subjectName} - Pertemuan ${item.meetingNo})`
        ),
        "",
        "Pilih salah satu di atas atau sesuaikan kembali pertanyaannya ya!"
      ].join("\n");
    } else {
      answer = "Maaf, Liona belum menemukan referensi terkait di sistem. Coba sampaikan dengan kata kunci lain ya!";
    }

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
        citations: citationsToSave,
        responseTimeMs,
      },
    });

    return NextResponse.json({
      sessionId,
      turnId: turn.id,
      question,
      answer,
      sources: citationsToSave,
      strictMatch: sources.length > 0,
      responseTimeMs,
    });
  } catch (error) {
    return serverError(error);
  }
}
