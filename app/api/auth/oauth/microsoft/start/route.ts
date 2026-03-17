import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { tooManyRequests } from "@/lib/http";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { writeSystemLog } from "@/lib/system-log";

const OAUTH_STATE_COOKIE = "oauth_microsoft_state";

function getBaseUrl(request: Request): string {
  const envBaseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envBaseUrl) return envBaseUrl;
  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `auth:oauth-microsoft-start:${ip}`,
    limit: 12,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.allowed) {
    writeSystemLog({
      level: "WARNING",
      category: "AUTH_OAUTH_MICROSOFT",
      message: "Rate limit OAuth Microsoft start tercapai",
      meta: { ip, retryAfterMs: rateLimit.retryAfterMs },
    });
    return tooManyRequests(
      "Terlalu banyak percobaan login Microsoft. Coba lagi sebentar.",
      rateLimit.retryAfterMs / 1000
    );
  }

  const clientId = process.env.MICROSOFT_OAUTH_CLIENT_ID;
  const tenantId = process.env.MICROSOFT_OAUTH_TENANT_ID || "common";

  if (!clientId) {
    writeSystemLog({
      level: "ERROR",
      category: "AUTH_OAUTH_MICROSOFT",
      message:
        "OAuth Microsoft belum dikonfigurasi (MICROSOFT_OAUTH_CLIENT_ID kosong)",
    });
    return NextResponse.redirect(
      new URL("/login?error=oauth_not_configured", request.url)
    );
  }

  const state = crypto.randomUUID();
  const cookieStore = await cookies();
  cookieStore.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 10 * 60,
    path: "/",
  });

  const url = new URL(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`
  );
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", `${getBaseUrl(request)}/api/auth/oauth/microsoft/callback`);
  url.searchParams.set("response_mode", "query");
  url.searchParams.set("scope", "openid profile email User.Read");
  url.searchParams.set("state", state);
  url.searchParams.set("prompt", "select_account");

  writeSystemLog({
    level: "INFO",
    category: "AUTH_OAUTH_MICROSOFT",
    message: "Memulai OAuth Microsoft",
    meta: { tenantId },
  });

  return NextResponse.redirect(url);
}
