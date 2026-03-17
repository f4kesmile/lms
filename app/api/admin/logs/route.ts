import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";

import { forbidden, serverError, unauthorized } from "@/lib/http";
import { getCurrentUser, hasRole } from "@/lib/current-user";
import { getSystemLogs, type SystemLogLevel } from "@/lib/system-log";

function parseLevel(value: string | null): SystemLogLevel | undefined {
  if (!value) return undefined;

  const normalized = value.toUpperCase();
  if (
    normalized === "INFO" ||
    normalized === "WARNING" ||
    normalized === "ERROR" ||
    normalized === "EMERGENCY" ||
    normalized === "DANGER"
  ) {
    return normalized;
  }

  return undefined;
}

export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorized("Not authorized");
    }

    if (!hasRole(currentUser.role, [UserRole.admin])) {
      return forbidden("Hanya admin yang dapat mengakses log sistem");
    }

    const requestUrl = new URL(request.url);
    const level = parseLevel(requestUrl.searchParams.get("level"));
    const limit = Number(requestUrl.searchParams.get("limit") || "120");

    const logs = getSystemLogs({
      level,
      limit: Number.isFinite(limit) ? limit : 120,
    });

    return NextResponse.json({
      logs,
      total: logs.length,
      level: level ?? "ALL",
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    return serverError(error, "API_ADMIN_LOGS_GET");
  }
}
