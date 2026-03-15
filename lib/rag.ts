import type { MaterialChunk } from "@prisma/client";

export type RankedChunk = {
  chunk: MaterialChunk & {
    material: {
      id: string;
      title: string;
      module: string;
      page: string | null;
    };
  };
  score: number;
};

const STOPWORDS = new Set([
  "dan",
  "yang",
  "di",
  "ke",
  "dari",
  "untuk",
  "dengan",
  "atau",
  "adalah",
  "itu",
  "ini",
  "the",
  "is",
  "are",
  "to",
  "of",
  "in",
  "a",
]);

const CHUNK_TOKEN_CACHE = new Map<string, string[]>();

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/gi, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOPWORDS.has(token));
}

export function splitIntoChunks(content: string, maxChars = 800): string[] {
  const paragraphs = content
    .split(/\n{2,}|\r\n{2,}/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return [content.trim()].filter(Boolean);
  }

  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if (!current) {
      current = paragraph;
      continue;
    }

    if ((current + "\n\n" + paragraph).length <= maxChars) {
      current += "\n\n" + paragraph;
      continue;
    }

    chunks.push(current);
    current = paragraph;
  }

  if (current) chunks.push(current);
  return chunks;
}

export function rankChunks(
  question: string,
  chunks: (MaterialChunk & {
    material: { id: string; title: string; module: string; page: string | null };
  })[],
  topK = 4,
  minScore = 0
): RankedChunk[] {
  const qTokens = tokenize(question);
  const qSet = new Set(qTokens);

  const ranked = chunks
    .map((chunk) => {
      const cached = CHUNK_TOKEN_CACHE.get(chunk.id);
      const cTokens = cached ?? tokenize(chunk.content);
      if (!cached) {
        CHUNK_TOKEN_CACHE.set(chunk.id, cTokens);
      }

      if (cTokens.length === 0) return { chunk, score: 0 };

      let overlap = 0;
      for (const token of cTokens) {
        if (qSet.has(token)) overlap += 1;
      }

      const score = overlap / Math.sqrt(cTokens.length);
      return { chunk, score };
    })
    .filter((item) => item.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return ranked;
}

export function buildSources(ranked: RankedChunk[]) {
  return ranked.map((item, index) => ({
    id: `S${index + 1}`,
    materialId: item.chunk.material.id,
    title: item.chunk.material.title,
    module: item.chunk.material.module,
    page: item.chunk.material.page,
    excerpt: item.chunk.content.slice(0, 220),
    score: Number(item.score.toFixed(4)),
  }));
}
