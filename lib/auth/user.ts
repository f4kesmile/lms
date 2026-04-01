import { type User,UserRole } from "@prisma/client";

import { getCurrentUserIdFromCookie } from "@/lib/auth/index";
import { prisma } from "@/lib/core/db";

export type SafeUser = Omit<User, "password">;

export async function getCurrentUser(): Promise<SafeUser | null> {
  const userId = await getCurrentUserIdFromCookie();

  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      studentClassId: true,
      nip: true,
      specialization: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export function hasRole(
  role: UserRole,
  allowedRoles: UserRole[]
): boolean {
  return allowedRoles.includes(role);
}
