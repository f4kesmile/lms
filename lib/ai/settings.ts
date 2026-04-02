import "server-only";

import { prisma } from "@/lib/core/db";

export type ChatbotSettings = {
  topK: number;
  minScore: number;
  systemPrompt: string;
};

export const DEFAULT_CHATBOT_SETTINGS: ChatbotSettings = {
  topK: 4,
  minScore: 0.08,
  systemPrompt:
    "Kamu adalah Liona, asisten belajar virtual kampus dan pemandu pembelajaran untuk mahasiswa serta dosen. Jawab hanya berdasarkan materi internal yang tersedia. Gunakan Bahasa Indonesia yang jelas, profesional, ramah, dan langsung ke inti. Jika pengguna meminta penerapan, hubungkan konsep dengan studi kasus atau konteks praktis dari materi yang relevan. Hindari pengulangan kalimat dan hindari jawaban bertele-tele. Setiap klaim utama wajib disertai sitasi angka kecil di atas (contoh: ¹, ², ³) yang merujuk ke sumber materi. Jika konteks kurang, ambigu, atau kemungkinan ada typo pada istilah pengguna, jangan mengarang: jelaskan batasannya, sebutkan interpretasi terdekat yang masuk akal, lalu minta klarifikasi singkat. Prioritaskan akurasi, konsistensi istilah, dan langkah penjelasan yang mudah diikuti.",
};

function normalizeSettings(
  input: Partial<ChatbotSettings> | null | undefined,
): ChatbotSettings {
  return {
    topK:
      typeof input?.topK === "number"
        ? Math.min(8, Math.max(1, Math.round(input.topK)))
        : DEFAULT_CHATBOT_SETTINGS.topK,
    minScore:
      typeof input?.minScore === "number"
        ? Math.min(1, Math.max(0, Number(input.minScore.toFixed(4))))
        : DEFAULT_CHATBOT_SETTINGS.minScore,
    systemPrompt:
      typeof input?.systemPrompt === "string" &&
      input.systemPrompt.trim().length > 0
        ? input.systemPrompt.trim()
        : DEFAULT_CHATBOT_SETTINGS.systemPrompt,
  };
}

async function ensureChatbotSettingsRow() {
  return prisma.chatbotSetting.upsert({
    where: { key: "default" },
    update: {},
    create: {
      key: "default",
      ...DEFAULT_CHATBOT_SETTINGS,
    },
  });
}

export async function readChatbotSettings(): Promise<ChatbotSettings> {
  const row = await ensureChatbotSettingsRow();
  return normalizeSettings(row);
}

export async function writeChatbotSettings(
  input: Partial<ChatbotSettings>,
): Promise<ChatbotSettings> {
  const current = await readChatbotSettings();
  const next = normalizeSettings({ ...current, ...input });

  await prisma.chatbotSetting.upsert({
    where: { key: "default" },
    update: next,
    create: {
      key: "default",
      ...next,
    },
  });

  return next;
}
