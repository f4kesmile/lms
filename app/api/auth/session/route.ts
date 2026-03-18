import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { serverError } from "@/lib/http";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
      },
    });
  } catch (error) {
    return serverError(error, "AUTH_SESSION");
  }
}