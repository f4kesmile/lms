import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentUser } from "@/lib/auth/user";
import { badRequest, notFound, serverError, unauthorized } from "@/lib/core/http";
import { prisma } from "@/lib/core/db";

const ratingSchema = z.object({
  rating: z.number().int().min(1).max(5),
  feedback: z.string().max(500).optional(),
});

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { id } = await context.params;
    const body = await request.json();
    const parsed = ratingSchema.safeParse(body);
    if (!parsed.success) return badRequest("Invalid rating payload");

    const existing = await prisma.chatTurn.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) return notFound("Chat turn not found");

    const updated = await prisma.chatTurn.update({
      where: { id },
      data: {
        rating: parsed.data.rating,
        feedback: parsed.data.feedback,
      },
      select: {
        id: true,
        rating: true,
        feedback: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return serverError(error);
  }
}
