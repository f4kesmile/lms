import { NextResponse } from "next/server";

import { writeSystemLog } from "@/lib/core/logs";

export function badRequest(message: string) {
  return NextResponse.json({ message }, { status: 400 });
}

export function unauthorized(message = "Not authorized") {
  return NextResponse.json({ message }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ message }, { status: 403 });
}

export function notFound(message = "Resource not found") {
  return NextResponse.json({ message }, { status: 404 });
}

export function tooManyRequests(message = "Too many requests", retryAfterSeconds = 60) {
  return NextResponse.json(
    { message },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, Math.ceil(retryAfterSeconds))),
      },
    }
  );
}

export function serverError(error: unknown, category = "SERVER_ERROR") {
  const message = error instanceof Error ? error.message : "Server error";
  const stack = error instanceof Error ? error.stack : undefined;

  writeSystemLog({
    level: "ERROR",
    category,
    message: "Unhandled server error",
    meta: { message, stack },
  });

  return NextResponse.json(
    {
      message:
        "Terjadi kesalahan sistem. Silakan cek log sistem dan hubungi admin.",
    },
    { status: 500 }
  );
}
