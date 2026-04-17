import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/user";
import { prisma } from "@/lib/core/db";
import { serverError, unauthorized } from "@/lib/core/http";

const MAX_AVATAR_BYTES = 350 * 1024;

function getBase64PayloadSize(dataUrl: string): number {
  const raw = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
  const padding = (raw.match(/=+$/) || [""])[0].length;
  return Math.floor((raw.length * 3) / 4) - padding;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorized("Not authorized");
    }

    const classLinks = await prisma.classStudent.findMany({
      where: { userId: currentUser.id },
      select: {
        classId: true,
        progress: true,
        class: {
          select: {
            id: true,
            name: true,
            subjects: {
              select: {
                subject: { select: { name: true, code: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      user: {
        ...currentUser,
        classLinks,
      },
    });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return unauthorized("Not authorized");
    }

    const body = (await req.json()) as {
      name?: string;
      avatarBase64?: string | null;
    };

    const nextName = body.name?.trim();
    if (!nextName || nextName.length < 2 || nextName.length > 80) {
      return NextResponse.json(
        { message: "Nama harus antara 2 sampai 80 karakter" },
        { status: 400 },
      );
    }

    let nextAvatar: string | null = null;
    if (typeof body.avatarBase64 === "string" && body.avatarBase64.trim()) {
      if (!body.avatarBase64.startsWith("data:image/")) {
        return NextResponse.json(
          { message: "Format avatar tidak valid" },
          { status: 400 },
        );
      }

      const avatarSize = getBase64PayloadSize(body.avatarBase64);
      if (avatarSize > MAX_AVATAR_BYTES) {
        return NextResponse.json(
          { message: "Ukuran avatar terlalu besar (maksimal 350KB)" },
          { status: 400 },
        );
      }

      nextAvatar = body.avatarBase64;
    }

    const updated = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: nextName,
        avatarBase64: nextAvatar,
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarBase64: true,
        role: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    return serverError(error);
  }
}
