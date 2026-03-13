import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { notFound, serverError, unauthorized } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await context.params;
    const session = await prisma.chatSession.findFirst({
      where: { id, userId: user.id },
      include: {
        turns: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) return notFound("Session not found");

    return NextResponse.json(session);
  } catch (error) {
    return serverError(error);
  }
}
