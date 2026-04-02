import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getAllowedEmailDomainsText,
  isAllowedEmail,
  isDomainRestrictionEnabled,
} from "@/lib/auth/domain";
import { setAuthCookie } from "@/lib/auth/index";
import { prisma } from "@/lib/core/db";
import { badRequest, serverError, tooManyRequests } from "@/lib/core/http";
import { checkRateLimit, getClientIp } from "@/lib/core/limiter";
import { writeSystemLog } from "@/lib/core/logs";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit({
      key: `auth:register:${ip}`,
      limit: 5,
      windowMs: 60 * 1000,
    });
    if (!rateLimit.allowed) {
      writeSystemLog({
        level: "WARNING",
        category: "AUTH_REGISTER",
        message: "Rate limit register tercapai",
        meta: { ip, retryAfterMs: rateLimit.retryAfterMs },
      });
      return tooManyRequests(
        "Terlalu banyak percobaan registrasi. Coba lagi sebentar.",
        rateLimit.retryAfterMs / 1000,
      );
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return badRequest("Invalid register payload");
    }

    const { name, email, password } = parsed.data;
    if (!isAllowedEmail(email)) {
      writeSystemLog({
        level: "WARNING",
        category: "AUTH_REGISTER",
        message: "Registrasi ditolak: domain email tidak diizinkan",
        meta: {
          email,
          domainRestrictionEnabled: isDomainRestrictionEnabled(),
          allowedDomains: getAllowedEmailDomainsText(),
        },
      });
      return badRequest(
        `Hanya email domain berikut yang diizinkan: ${getAllowedEmailDomainsText()}`,
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      writeSystemLog({
        level: "WARNING",
        category: "AUTH_REGISTER",
        message: "Registrasi ditolak: email sudah terdaftar",
        meta: { email },
      });
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

    await setAuthCookie(user.id, user.role);

    writeSystemLog({
      level: "INFO",
      category: "AUTH_REGISTER",
      message: "Registrasi berhasil",
      meta: { userId: user.id, email: user.email },
    });

    return NextResponse.json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    return serverError(error, "AUTH_REGISTER");
  }
}
