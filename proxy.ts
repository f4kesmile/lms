import { jwtVerify } from "jose";
import { type NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "jwt";
const JWT_ALGORITHM = "HS512";

type JwtPayload = {
  userId: string;
  role?: "admin" | "dosen" | "mahasiswa";
};

function getPostLoginPathByRole(role?: JwtPayload["role"]): string {
  if (role === "admin") return "/admin/dashboard";
  if (role === "dosen") return "/admin/teaching-schedule";
  return "/courses";
}

function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(0),
    path: "/",
  });
}

async function getValidSessionPayload(
  request: NextRequest,
): Promise<JwtPayload | null> {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;

  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify<JwtPayload>(
      token,
      new TextEncoder().encode(secret),
      {
        algorithms: [JWT_ALGORITHM],
      },
    );

    if (!payload.userId) return null;

    return {
      userId: payload.userId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(AUTH_COOKIE_NAME)?.value);
  const sessionPayload = await getValidSessionPayload(request);
  const isAuthenticated = Boolean(sessionPayload);

  if (hasToken && !isAuthenticated) {
    if (pathname === "/login" || pathname === "/register") {
      const response = NextResponse.next();
      clearAuthCookie(response);
      return response;
    }

    if (pathname.startsWith("/api/admin")) {
      const response = NextResponse.json(
        { message: "Not authorized" },
        { status: 401 },
      );
      clearAuthCookie(response);
      return response;
    }

    if (pathname.startsWith("/admin")) {
      const response = NextResponse.redirect(
        new URL("/unauthorized?next=/login", request.url),
      );
      clearAuthCookie(response);
      return response;
    }
  }

  if ((pathname === "/login" || pathname === "/register") && isAuthenticated) {
    return NextResponse.redirect(
      new URL(getPostLoginPathByRole(sessionPayload?.role), request.url),
    );
  }

  if (pathname.startsWith("/api/admin") && !isAuthenticated) {
    return NextResponse.json({ message: "Not authorized" }, { status: 401 });
  }

  if (pathname.startsWith("/admin") && !isAuthenticated) {
    return NextResponse.redirect(
      new URL("/unauthorized?next=/login", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login", "/register"],
};
