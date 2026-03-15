import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { serverError, unauthorized } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const templates = [
  "Jelaskan konsep inti dari {title}",
  "Apa poin penting pada {title}?",
  "Berikan rangkuman singkat {title}",
  "Bagaimana penerapan {title} dalam praktik?",
  "Apa kesalahan umum saat mempelajari {title}?",
  "Beri contoh sederhana terkait {title}",
];

function shuffle<T>(items: T[]): T[] {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit") || 8), 12);

    const materials = await prisma.courseMaterial.findMany({
      orderBy: { updatedAt: "desc" },
      take: 40,
      select: {
        id: true,
        title: true,
        module: true,
      },
    });

    const groupedByModule = new Map<string, typeof materials>();
    for (const material of materials) {
      const key = material.module || "Tanpa Modul";
      const bucket = groupedByModule.get(key) || [];
      bucket.push(material);
      groupedByModule.set(key, bucket);
    }

    const moduleKeys = shuffle(Array.from(groupedByModule.keys()));
    const moduleQueues = moduleKeys.map((key) => ({
      key,
      materials: shuffle(groupedByModule.get(key) || []),
      templateOrder: shuffle(templates),
      nextMaterial: 0,
      nextTemplate: 0,
    }));

    const suggestions: string[] = [];
    const seen = new Set<string>();

    while (suggestions.length < limit) {
      let addedInRound = false;

      for (const queue of moduleQueues) {
        if (suggestions.length >= limit) break;
        if (queue.materials.length === 0) continue;

        const material = queue.materials[queue.nextMaterial % queue.materials.length];
        const template = queue.templateOrder[queue.nextTemplate % queue.templateOrder.length];
        const suggestion = template.replace("{title}", material.title);

        queue.nextTemplate += 1;
        if (queue.nextTemplate % queue.templateOrder.length === 0) {
          queue.nextMaterial += 1;
        }

        if (seen.has(suggestion)) continue;

        seen.add(suggestion);
        suggestions.push(suggestion);
        addedInRound = true;
      }

      if (!addedInRound) break;
    }

    return NextResponse.json({
      suggestions,
      materials: materials.map((m) => ({ id: m.id, title: m.title, module: m.module })),
    });
  } catch (error) {
    return serverError(error);
  }
}
