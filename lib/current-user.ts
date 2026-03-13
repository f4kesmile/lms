import { UserRole, type User } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getCurrentUserIdFromCookie } from "@/lib/auth";

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
