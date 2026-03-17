import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { setAuthCookie } from "@/lib/auth";
import { getAllowedEmailDomainsText, isAllowedEmail } from "@/lib/auth-domain";
import { badRequest, serverError, tooManyRequests, unauthorized } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { writeSystemLog } from "@/lib/system-log";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit({
      key: `auth:login:${ip}`,
      limit: 8,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      writeSystemLog({
        level: "WARNING",
        category: "AUTH_LOGIN",
        message: "Rate limit login tercapai",
        meta: { ip, retryAfterMs: rateLimit.retryAfterMs },
      });
      return tooManyRequests(
        "Terlalu banyak percobaan login. Coba lagi sebentar.",
        rateLimit.retryAfterMs / 1000
      );
    }

    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid login payload");
    }

    const { email, password } = parsed.data;
    if (!isAllowedEmail(email)) {
      writeSystemLog({
        level: "WARNING",
        category: "AUTH_LOGIN",
        message: "Login ditolak: domain email tidak diizinkan",
        meta: { email, allowedDomains: getAllowedEmailDomainsText() },
      });
      return unauthorized(
        `Domain email tidak diizinkan. Domain aktif: ${getAllowedEmailDomainsText()}`
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      writeSystemLog({
        level: "WARNING",
        category: "AUTH_LOGIN",
        message: "Login gagal: email tidak ditemukan",
        meta: { email },
      });
      return unauthorized("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      writeSystemLog({
        level: "WARNING",
        category: "AUTH_LOGIN",
        message: "Login gagal: password tidak cocok",
        meta: { email, userId: user.id },
      });
      return unauthorized("Invalid email or password");
    }

    await setAuthCookie(user.id);

    writeSystemLog({
      level: "INFO",
      category: "AUTH_LOGIN",
      message: "Login berhasil",
      meta: { userId: user.id, role: user.role },
    });

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
    return serverError(error, "AUTH_LOGIN");
  }
}
