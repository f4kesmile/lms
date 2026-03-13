import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { unauthorized, serverError } from "@/lib/http";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorized("Not authorized");
    }

    return NextResponse.json({ user });
  } catch (error) {
    return serverError(error);
  }
}
