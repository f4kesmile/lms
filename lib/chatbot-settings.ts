import "server-only";

import { prisma } from "@/lib/prisma";

export type ChatbotSettings = {
  topK: number;
  minScore: number;
  systemPrompt: string;
};

export const DEFAULT_CHATBOT_SETTINGS: ChatbotSettings = {
  topK: 4,
  minScore: 0.08,
  systemPrompt:
    "Kamu adalah asisten belajar virtual. Jawab hanya berdasarkan konteks materi internal yang diberikan. Jika konteks kurang, katakan keterbatasannya. Setiap klaim utama harus menyertakan sitasi [Sx]. Gunakan Bahasa Indonesia yang jelas dan ringkas.",
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
      typeof input?.systemPrompt === "string" && input.systemPrompt.trim().length > 0
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
