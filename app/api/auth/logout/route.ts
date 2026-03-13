import { NextResponse } from "next/server";

import { clearAuthCookie } from "@/lib/auth";
import { serverError } from "@/lib/http";

export async function POST() {
  try {
    await clearAuthCookie();
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    return serverError(error);
  }
}
