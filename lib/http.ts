import { NextResponse } from "next/server";

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

export function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : "Server error";
  return NextResponse.json({ message }, { status: 500 });
}
