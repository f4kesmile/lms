import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { readChatbotSettings, writeChatbotSettings } from "@/lib/chatbot-settings";
import { getCurrentUser, hasRole } from "@/lib/current-user";
import { badRequest, forbidden, serverError, unauthorized } from "@/lib/http";

const chatbotSettingsSchema = z.object({
  topK: z.number().int().min(1).max(8),
  minScore: z.number().min(0).max(1),
  systemPrompt: z.string().min(20).max(4000),
});

async function authorizeAdmin() {
  const currentUser = await getCurrentUser();
  if (!currentUser) return unauthorized();
  if (!hasRole(currentUser.role, [UserRole.admin])) {
    return forbidden("Hanya admin yang dapat mengatur konfigurasi chatbot");
  }
  return null;
}

export async function GET() {
  try {
    const authError = await authorizeAdmin();
    if (authError) return authError;

    const settings = await readChatbotSettings();
    return NextResponse.json(settings);
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const authError = await authorizeAdmin();
    if (authError) return authError;

    const body = await request.json();
    const parsed = chatbotSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("Payload pengaturan chatbot tidak valid");
    }

    const settings = await writeChatbotSettings(parsed.data);
    return NextResponse.json({
      message: "Pengaturan chatbot berhasil disimpan",
      settings,
    });
  } catch (error) {
    return serverError(error);
  }
}
