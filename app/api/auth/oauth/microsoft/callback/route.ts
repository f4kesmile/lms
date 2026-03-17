import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { setAuthCookie } from "@/lib/auth";
import {
  getAllowedEmailDomainsText,
  isAllowedEmail,
  isDomainRestrictionEnabled,
} from "@/lib/auth-domain";
import { prisma } from "@/lib/prisma";
import { writeSystemLog } from "@/lib/system-log";

const OAUTH_STATE_COOKIE = "oauth_microsoft_state";

type MicrosoftTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type MicrosoftUserInfo = {
  name?: string;
  email?: string;
  preferred_username?: string;
};

function getBaseUrl(request: Request): string {
  const envBaseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (envBaseUrl) return envBaseUrl;
  return new URL(request.url).origin;
}

function redirectToLogin(request: Request, errorCode: string) {
  writeSystemLog({
    level: "WARNING",
    category: "AUTH_OAUTH_MICROSOFT",
    message: "OAuth callback Microsoft gagal",
    meta: { errorCode },
  });

  const url = new URL("/login", request.url);
  url.searchParams.set("error", errorCode);
  return NextResponse.redirect(url);
}

export async function GET(request: Request) {
  const clientId = process.env.MICROSOFT_OAUTH_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_OAUTH_CLIENT_SECRET;
  const tenantId = process.env.MICROSOFT_OAUTH_TENANT_ID || "common";

  if (!clientId || !clientSecret) {
    return redirectToLogin(request, "oauth_not_configured");
  }

  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  if (!code || !state) {
    return redirectToLogin(request, "oauth_invalid_callback");
  }

  const cookieStore = await cookies();
  const stateFromCookie = cookieStore.get(OAUTH_STATE_COOKIE)?.value;
  cookieStore.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  if (!stateFromCookie || stateFromCookie !== state) {
    return redirectToLogin(request, "oauth_state_mismatch");
  }

  const tokenResponse = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${getBaseUrl(request)}/api/auth/oauth/microsoft/callback`,
        grant_type: "authorization_code",
      }).toString(),
    }
  );

  const tokenData = (await tokenResponse.json()) as MicrosoftTokenResponse;
  if (!tokenResponse.ok || !tokenData.access_token) {
    return redirectToLogin(request, "oauth_token_failed");
  }

  const profileResponse = await fetch("https://graph.microsoft.com/oidc/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
    cache: "no-store",
  });

  const profile = (await profileResponse.json()) as MicrosoftUserInfo;
  const emailRaw = profile.email || profile.preferred_username;
  if (!profileResponse.ok || !emailRaw) {
    return redirectToLogin(request, "oauth_email_unverified");
  }

  const email = emailRaw.toLowerCase();
  if (!isAllowedEmail(email)) {
    writeSystemLog({
      level: "WARNING",
      category: "AUTH_OAUTH_MICROSOFT",
      message: "OAuth Microsoft ditolak: domain email tidak diizinkan",
      meta: {
        email,
        domainRestrictionEnabled: isDomainRestrictionEnabled(),
        allowedDomains: getAllowedEmailDomainsText(),
      },
    });
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "oauth_domain_not_allowed");
    url.searchParams.set("allowed", getAllowedEmailDomainsText());
    return NextResponse.redirect(url);
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  const user =
    existingUser ??
    (await prisma.user.create({
      data: {
        name: profile.name?.trim() || email.split("@")[0],
        email,
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

  if (!user.isActive) {
    return redirectToLogin(request, "account_inactive");
  }

  await setAuthCookie(user.id);

  writeSystemLog({
    level: "INFO",
    category: "AUTH_OAUTH_MICROSOFT",
    message: "OAuth Microsoft berhasil login",
    meta: { userId: user.id, role: user.role, email },
  });

  const nextUrl = new URL(
    user.role === UserRole.mahasiswa ? "/courses" : "/admin/dashboard",
    request.url
  );
  return NextResponse.redirect(nextUrl);
}
