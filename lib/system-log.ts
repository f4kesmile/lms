import { prisma } from "@/lib/prisma";

export type SystemLogLevel =
  | "INFO"
  | "WARNING"
  | "ERROR"
  | "EMERGENCY"
  | "DANGER";

export type SystemLogEntry = {
  id: string;
  timestamp: string;
  level: SystemLogLevel;
  category: string;
  message: string;
  meta?: unknown;
};

type GlobalWithLogPrune = typeof globalThis & {
  __NUSA_BELAJAR_LOG_WRITE_COUNT__?: number;
};

function getMaxLogRecords(): number {
  const raw = Number(process.env.LOG_MAX_RECORDS || "10000");
  if (!Number.isFinite(raw)) return 10000;
  return Math.min(Math.max(Math.floor(raw), 100), 100000);
}

function getLogRetentionDays(): number {
  const raw = Number(process.env.LOG_RETENTION_DAYS || "30");
  if (!Number.isFinite(raw)) return 30;
  return Math.min(Math.max(Math.floor(raw), 1), 365);
}

function sanitizeMessage(message: string): string {
  const trimmed = message.trim();
  if (trimmed.length <= 400) return trimmed;
  return `${trimmed.slice(0, 397)}...`;
}

function sanitizeMeta(meta: unknown): unknown {
  if (meta === undefined) return undefined;

  try {
    const asText = JSON.stringify(meta);
    if (!asText) return undefined;

    if (asText.length <= 4000) {
      return JSON.parse(asText);
    }

    return {
      truncated: true,
      preview: asText.slice(0, 4000),
    };
  } catch {
    return { truncated: true, preview: "[non-serializable-meta]" };
  }
}

async function pruneOverflowIfNeeded() {
  const globalCounter = globalThis as GlobalWithLogPrune;
  globalCounter.__NUSA_BELAJAR_LOG_WRITE_COUNT__ =
    (globalCounter.__NUSA_BELAJAR_LOG_WRITE_COUNT__ ?? 0) + 1;

  // Prune every 10 writes to reduce DB overhead.
  if (globalCounter.__NUSA_BELAJAR_LOG_WRITE_COUNT__ % 10 !== 0) {
    return;
  }

  const maxRecords = getMaxLogRecords();
  const retentionDays = getLogRetentionDays();

  const retentionCutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  await prisma.systemLog.deleteMany({
    where: {
      createdAt: {
        lt: retentionCutoff,
      },
    },
  });

  const staleRows = await prisma.systemLog.findMany({
    orderBy: { createdAt: "desc" },
    skip: maxRecords,
    take: 1000,
    select: { id: true },
  });

  if (staleRows.length === 0) return;

  await prisma.systemLog.deleteMany({
    where: { id: { in: staleRows.map((row) => row.id) } },
  });
}

export function writeSystemLog(input: {
  level: SystemLogLevel;
  category: string;
  message: string;
  meta?: unknown;
}): SystemLogEntry {
  const timestamp = new Date().toISOString();
  const entry: SystemLogEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp,
    level: input.level,
    category: input.category,
    message: sanitizeMessage(input.message),
    meta: sanitizeMeta(input.meta),
  };

  const line = `[${entry.level}] [${entry.category}] ${entry.message}`;
  if (
    entry.level === "ERROR" ||
    entry.level === "EMERGENCY" ||
    entry.level === "DANGER"
  ) {
    console.error(line, entry.meta ?? "");
  } else if (entry.level === "WARNING") {
    console.warn(line, entry.meta ?? "");
  } else {
    console.info(line, entry.meta ?? "");
  }

  void prisma.systemLog
    .create({
      data: {
        level: entry.level,
        category: entry.category,
        message: entry.message,
        meta: entry.meta as object | undefined,
      },
    })
    .then(() => pruneOverflowIfNeeded())
    .catch((error) => {
      console.error("[ERROR] [SYSTEM_LOG] gagal simpan log ke database", error);
    });

  return entry;
}

export async function getSystemLogs(filter?: {
  level?: SystemLogLevel;
  limit?: number;
}): Promise<SystemLogEntry[]> {
  const level = filter?.level;
  const limit = Math.max(1, Math.min(filter?.limit ?? 120, 400));

  const rows = await prisma.systemLog.findMany({
    where: level ? { level } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      level: true,
      category: true,
      message: true,
      meta: true,
      createdAt: true,
    },
  });

  return rows.map((row) => ({
    id: row.id,
    timestamp: row.createdAt.toISOString(),
    level: row.level as SystemLogLevel,
    category: row.category,
    message: row.message,
    meta: row.meta ?? undefined,
  }));
}
