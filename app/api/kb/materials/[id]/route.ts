import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentUser, hasRole } from "@/lib/current-user";
import { forbidden, notFound, serverError, unauthorized } from "@/lib/http";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, context: Context) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!hasRole(user.role, [UserRole.admin, UserRole.dosen])) {
      return forbidden("Only admin or dosen can delete materials");
    }

    const { id } = await context.params;
    const existing = await prisma.courseMaterial.findUnique({ where: { id } });

    if (!existing) return notFound("Material not found");

    await prisma.courseMaterial.delete({ where: { id } });
    return NextResponse.json({ message: "Material deleted" });
  } catch (error) {
    return serverError(error);
  }
}
