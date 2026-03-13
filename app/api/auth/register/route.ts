import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { setAuthCookie } from "@/lib/auth";
import { badRequest, serverError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid register payload");
    }

    const { name, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return badRequest("Email already registered");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.mahasiswa,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    await setAuthCookie(user.id);

    return NextResponse.json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    return serverError(error);
  }
}
