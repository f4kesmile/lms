type Source = {
  id: string;
  title: string;
  module: string;
  page: string | null;
  excerpt: string;
};

import { readChatbotSettings } from "@/lib/chatbot-settings";

function normalizeExcerpt(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export async function generateChatAnswer(params: {
  question: string;
  sources: Source[];
}): Promise<string> {
  const { question, sources } = params;
  const settings = await readChatbotSettings();
  const _promptGuidance = settings.systemPrompt;

  if (sources.length === 0) {
    return "Maaf, saya belum menemukan materi yang relevan untuk menjawab pertanyaan ini. Silakan unggah materi atau perjelas pertanyaan.";
  }

  const primary = sources[0];
  const references = sources.slice(0, 4);

  const referenceLines = references.map((source) => {
    const pageInfo = source.page ? `, hal. ${source.page}` : "";
    return `- [${source.id}] ${source.module} - ${source.title}${pageInfo}`;
  });

  const keyPoints = references
    .map((source) => {
      const excerpt = normalizeExcerpt(source.excerpt);
      return excerpt ? `- ${excerpt} [${source.id}]` : "";
    })
    .filter(Boolean);

  return [
    `Inti jawaban berdasarkan materi internal: ${normalizeExcerpt(primary.excerpt)} [${primary.id}]`,
    "",
    `Pertanyaan: ${question}`,
    "",
    "Poin penting:",
    ...(keyPoints.length > 0 ? keyPoints : ["- Detail rinci dapat dilihat pada referensi sumber."]),
    "",
    "Referensi:",
    ...referenceLines,
    "",
    "Jika konteks belum cukup spesifik, saya bisa jelaskan lebih rinci dari sumber yang tersedia.",
  ].join("\n");
}
