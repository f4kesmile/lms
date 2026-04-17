import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

import { getCurrentUser, hasRole } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import {
  forbidden,
  notFound,
  serverError,
  unauthorized,
} from "@/lib/core/http";

const allowedRoles = [UserRole.admin, UserRole.dosen];

type Context = {
  params: Promise<{ id: string }>;
};

/**
 * Generate a temporary password (8 characters: mix of uppercase, lowercase, numbers, special chars)
 */
function generateTemporaryPassword(): string {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*";

  const chars = uppercase + lowercase + numbers + special;
  let password = "";

  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < 8; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }

  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export async function POST(request: Request, context: Context) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) return unauthorized();
    if (!hasRole(currentUser.role, allowedRoles)) {
      return forbidden("User is not authorized to access this route");
    }

    const { id } = await context.params;

    const existing = await prisma.user.findUnique({ where: { id } });

    if (!existing) {
      return notFound("User not found");
    }

    // Generate temporary password
    const tempPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update user password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      message: "Password berhasil direset",
      tempPassword,
      email: existing.email,
      name: existing.name,
    });
  } catch (error) {
    return serverError(error);
  }
}
