import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth/index";

export async function POST() {
  await clearAuthCookie();
  return NextResponse.json({ message: "Sesi telah diakhiri" });
}
