import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentUser, hasRole } from "@/lib/current-user";
import { badRequest, serverError, unauthorized, forbidden } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const faqs = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ faqs });
  } catch (error) {
    return serverError(error);
  }
}

type CreateFaqBody = {
  question: string;
  answer: string;
  category?: string;
  sortOrder?: number;
};

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorized();

    if (!hasRole(currentUser.role, [UserRole.admin])) {
      return forbidden("Only admin can create FAQs");
    }

    const body = (await request.json()) as CreateFaqBody;

    if (!body.question?.trim() || !body.answer?.trim()) {
      return badRequest("question and answer are required");
    }

    const faq = await prisma.faq.create({
      data: {
        question: body.question.trim(),
        answer: body.answer.trim(),
        category: body.category?.trim() || "Umum",
        sortOrder: body.sortOrder ?? 0,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}
