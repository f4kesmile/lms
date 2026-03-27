import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAllowedEmailDomains } from "@/lib/auth/domain";
import { tooManyRequests } from "@/lib/core/http";
import { checkRateLimit, getClientIp } from "@/lib/core/limiter";
import { writeSystemLog } from "@/lib/core/logs";

const OAUTH_STATE_COOKIE = "oauth_google_state";

function getBaseUrl(request: Request): string {
  const envBaseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envBaseUrl) return envBaseUrl;
  return new URL(request.url).origin;
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit({
    key: `auth:oauth-google-start:${ip}`,
    limit: 12,
    windowMs: 60 * 1000,
  });
  if (!rateLimit.allowed) {
    writeSystemLog({
      level: "WARNING",
      category: "AUTH_OAUTH_GOOGLE",
      message: "Rate limit OAuth Google start tercapai",
      meta: { ip, retryAfterMs: rateLimit.retryAfterMs },
    });
    return tooManyRequests(
      "Terlalu banyak percobaan login Google. Coba lagi sebentar.",
      rateLimit.retryAfterMs / 1000
    );
  }

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const allowedDomains = getAllowedEmailDomains();
  const forceAccountChooser =
    process.env.GOOGLE_OAUTH_FORCE_ACCOUNT_CHOOSER === "true";

  if (!clientId) {
    writeSystemLog({
      level: "ERROR",
      category: "AUTH_OAUTH_GOOGLE",
      message: "OAuth Google belum dikonfigurasi (GOOGLE_OAUTH_CLIENT_ID kosong)",
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

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set(
    "redirect_uri",
    `${getBaseUrl(request)}/api/auth/oauth/google/callback`
  );
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);

  // Faster default: let Google reuse active session.
  // Set GOOGLE_OAUTH_FORCE_ACCOUNT_CHOOSER=true to force account picker each time.
  if (forceAccountChooser) {
    url.searchParams.set("prompt", "select_account");
  }

  // Hint to Google account picker; actual enforcement still happens in callback.
  if (allowedDomains.length === 1) {
    url.searchParams.set("hd", allowedDomains[0]);
  }

  writeSystemLog({
    level: "INFO",
    category: "AUTH_OAUTH_GOOGLE",
    message: "Memulai OAuth Google",
    meta: { allowedDomains, forceAccountChooser },
  });

  return NextResponse.redirect(url);
}
