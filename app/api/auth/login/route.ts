import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { setAuthCookie } from "@/lib/auth";
import { badRequest, serverError, unauthorized } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid login payload");
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return unauthorized("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return unauthorized("Invalid email or password");
    }

    await setAuthCookie(user.id);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return serverError(error);
  }
}
