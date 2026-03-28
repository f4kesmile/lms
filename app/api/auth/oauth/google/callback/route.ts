import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { setAuthCookie } from "@/lib/auth/index";
import {
  getAllowedEmailDomainsText,
  isAllowedEmail,
  isDomainRestrictionEnabled,
} from "@/lib/auth/domain";
import { prisma } from "@/lib/core/db";
import { writeSystemLog } from "@/lib/core/logs";

const OAUTH_STATE_COOKIE = "oauth_google_state";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleUserInfo = {
  email?: string;
  name?: string;
  email_verified?: boolean;
};

function isOAuthDebugTimingEnabled(): boolean {
  return process.env.AUTH_OAUTH_DEBUG_TIMING === "true";
}

function getOAuthLatencyWarnMs(): number {
  const raw = Number(process.env.AUTH_OAUTH_LATENCY_WARN_MS || "2500");
  if (!Number.isFinite(raw)) return 2500;
  return Math.min(Math.max(Math.floor(raw), 300), 20000);
}

function maskEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const atIndex = trimmed.indexOf("@");
  if (atIndex <= 1) return "***";

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex + 1);
  if (!domain) return "***";

  if (local.length <= 2) {
    return `${local[0] ?? "*"}***@${domain}`;
  }

  return `${local.slice(0, 2)}***@${domain}`;
}

function getBaseUrl(request: Request): string {
  const envBaseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envBaseUrl) return envBaseUrl;
  return new URL(request.url).origin;
}

function redirectToLogin(
  request: Request,
  errorCode: string,
  meta?: Record<string, unknown>
) {
  writeSystemLog({
    level: "WARNING",
    category: "AUTH_OAUTH_GOOGLE",
    message: "OAuth callback gagal",
    meta: { errorCode, ...(meta ?? {}) },
  });
  const url = new URL("/login", request.url);
  url.searchParams.set("error", errorCode);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  let stage = "init";
  const debugTimingEnabled = isOAuthDebugTimingEnabled();
  const latencyWarnMs = getOAuthLatencyWarnMs();

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return redirectToLogin(request, "oauth_not_configured", {
      stage,
      elapsedMs: Date.now() - startedAt,
    });
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  if (!code || !state) {
    return redirectToLogin(request, "oauth_invalid_callback", {
      stage,
      elapsedMs: Date.now() - startedAt,
    });
  }

  stage = "state_verification";
  const cookieStore = await cookies();
  const stateFromCookie = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  if (!stateFromCookie || stateFromCookie !== state) {
    return redirectToLogin(request, "oauth_state_mismatch", {
      stage,
      elapsedMs: Date.now() - startedAt,
    });
  }

  stage = "token_exchange";
  const tokenStartedAt = Date.now();
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${getBaseUrl(request)}/api/auth/oauth/google/callback`,
      grant_type: "authorization_code",
    }).toString(),
  });
  const tokenMs = Date.now() - tokenStartedAt;

  const tokenData = (await tokenResponse.json()) as GoogleTokenResponse;
  if (!tokenResponse.ok || !tokenData.access_token) {
    return redirectToLogin(request, "oauth_token_failed", {
      stage,
      tokenMs,
      elapsedMs: Date.now() - startedAt,
    });
  }

  stage = "profile_fetch";
  const profileStartedAt = Date.now();
  const profileResponse = await fetch(
    "https://openidconnect.googleapis.com/v1/userinfo",
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
      cache: "no-store",
    }
  );
  const profileMs = Date.now() - profileStartedAt;

  const profile = (await profileResponse.json()) as GoogleUserInfo;
  if (!profileResponse.ok || !profile.email || !profile.email_verified) {
    return redirectToLogin(request, "oauth_email_unverified", {
      stage,
      profileMs,
      elapsedMs: Date.now() - startedAt,
    });
  }

  const email = profile.email.toLowerCase();
  const emailMasked = maskEmail(email);
  if (!isAllowedEmail(email)) {
    writeSystemLog({
      level: "WARNING",
      category: "AUTH_OAUTH_GOOGLE",
      message: "OAuth ditolak: domain email tidak diizinkan",
      meta: {
        email: emailMasked,
        domainRestrictionEnabled: isDomainRestrictionEnabled(),
        allowedDomains: getAllowedEmailDomainsText(),
      },
    });
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "oauth_domain_not_allowed");
    url.searchParams.set("allowed", getAllowedEmailDomainsText());
    return NextResponse.redirect(url);
  }

  stage = "db_lookup_user";
  const lookupStartedAt = Date.now();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  const dbLookupMs = Date.now() - lookupStartedAt;

  let dbCreateMs = 0;
  let userWasCreated = false;
  let createStartedAt = 0;

  if (!existingUser) {
    stage = "db_create_user";
    createStartedAt = Date.now();
  }

  const user =
    existingUser ??
    (await prisma.user.create({
      data: {
        name: profile.name?.trim() || email.split("@")[0],
        email,
        // Placeholder random hash so the required password field remains valid.
        password: await bcrypt.hash(crypto.randomUUID(), 10),
        role: UserRole.mahasiswa,
        isActive: true,
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    }));

  if (!existingUser) {
    userWasCreated = true;
    dbCreateMs = Date.now() - createStartedAt;
  }

  if (!user.isActive) {
    return redirectToLogin(request, "account_inactive", {
      stage,
      dbLookupMs,
      dbCreateMs,
      elapsedMs: Date.now() - startedAt,
    });
  }

  stage = "set_auth_cookie";
  const setCookieStartedAt = Date.now();
  await setAuthCookie(user.id);
  const setCookieMs = Date.now() - setCookieStartedAt;

  const totalMs = Date.now() - startedAt;
  const steps = [
    { key: "tokenMs", value: tokenMs },
    { key: "profileMs", value: profileMs },
    { key: "dbLookupMs", value: dbLookupMs },
    { key: "dbCreateMs", value: dbCreateMs },
    { key: "setCookieMs", value: setCookieMs },
  ];
  const slowestStep = steps.reduce((prev, curr) =>
    curr.value > prev.value ? curr : prev
  );

  writeSystemLog({
    level: "INFO",
    category: "AUTH_OAUTH_GOOGLE",
    message: "OAuth Google berhasil login",
    meta: debugTimingEnabled
      ? {
          userId: user.id,
          role: user.role,
          email: emailMasked,
          userWasCreated,
          totalMs,
          tokenMs,
          profileMs,
          dbLookupMs,
          dbCreateMs,
          setCookieMs,
          slowestStep: slowestStep.key,
          slowestStepMs: slowestStep.value,
          debugTimingEnabled,
        }
      : {
          userId: user.id,
          role: user.role,
          email: emailMasked,
          userWasCreated,
        },
  });

  if (totalMs >= latencyWarnMs) {
    writeSystemLog({
      level: "WARNING",
      category: "AUTH_OAUTH_GOOGLE",
      message: "OAuth Google latency tinggi",
      meta: {
        email: emailMasked,
        latencyWarnMs,
        totalMs,
        tokenMs,
        profileMs,
        dbLookupMs,
        dbCreateMs,
        setCookieMs,
        slowestStep: slowestStep.key,
        slowestStepMs: slowestStep.value,
      },
    });
  }

  const nextUrl = new URL(
    user.role === UserRole.mahasiswa
      ? "/courses"
      : user.role === UserRole.dosen
        ? "/admin/teaching-schedule"
        : "/admin/dashboard",
    request.url
  );
  return NextResponse.redirect(nextUrl);
}
