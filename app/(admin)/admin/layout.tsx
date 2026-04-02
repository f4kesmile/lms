import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

import { getCurrentUser, hasRole } from "@/lib/auth/user";

export default async function AdminRouteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/unauthorized?next=/login");
  }

  if (!hasRole(currentUser.role, [UserRole.admin, UserRole.dosen])) {
    redirect("/forbidden?next=/");
  }

  return children;
}
