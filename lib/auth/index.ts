import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

type JwtPayload = {
  userId: string;
};

const COOKIE_NAME = "jwt";
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export function signAuthToken(userId: string): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ userId }, secret, {
    expiresIn: "30d",
    algorithm: "HS512",
  });
}

export function verifyAuthToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.verify(token, secret) as JwtPayload;
}

export async function setAuthCookie(userId: string): Promise<void> {
  const token = signAuthToken(userId);
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: THIRTY_DAYS_MS / 1000,
    path: "/",
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });
}

export async function getCurrentUserIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const payload = verifyAuthToken(token);
    return payload.userId;
  } catch {
    return null;
  }
}
