import { NextResponse } from "next/server";
import { z } from "zod";

import { generateChatAnswer } from "@/lib/ai/chatbot";
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

    const settings = await readChatbotSettings();
    const { question, topK = settings.topK } = parsed.data;
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

    const answer =
      sources.length > 0
        ? await generateChatAnswer({ question, sources })
        : nearestSources.length > 0
          ? [
              "Saya tidak menemukan kecocokan kuat untuk pertanyaan Anda. Kemungkinan ada typo atau istilah yang berbeda dari materi.",
              "",
              "Materi terdekat yang masih relevan:",
              ...nearestSources.slice(0, 5).map((item) =>
                `- [${item.id}] ${item.title} (${item.subjectName} - Pertemuan ${item.meetingNo})`,
              ),
              "",
              "Silakan pilih salah satu materi di atas atau tulis ulang pertanyaan dengan kata kunci yang lebih spesifik.",
            ].join("\n")
          : "Maaf, saya belum menemukan materi yang cukup relevan. Silakan unggah materi atau perjelas pertanyaan.";

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
    const citationsToSave = sources.length > 0 ? sources : nearestSources;

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
