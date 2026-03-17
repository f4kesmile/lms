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

const MAX_LOGS = 600;

type GlobalWithLogs = typeof globalThis & {
  __NUSA_BELAJAR_SYSTEM_LOGS__?: SystemLogEntry[];
};

function getStore(): SystemLogEntry[] {
  const globalWithLogs = globalThis as GlobalWithLogs;
  if (!globalWithLogs.__NUSA_BELAJAR_SYSTEM_LOGS__) {
    globalWithLogs.__NUSA_BELAJAR_SYSTEM_LOGS__ = [];
  }
  return globalWithLogs.__NUSA_BELAJAR_SYSTEM_LOGS__;
}

function buildLogId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function writeSystemLog(input: {
  level: SystemLogLevel;
  category: string;
  message: string;
  meta?: unknown;
}): SystemLogEntry {
  const entry: SystemLogEntry = {
    id: buildLogId(),
    timestamp: new Date().toISOString(),
    level: input.level,
    category: input.category,
    message: input.message,
    meta: input.meta,
  };

  const store = getStore();
  store.unshift(entry);
  if (store.length > MAX_LOGS) {
    store.length = MAX_LOGS;
  }

  const line = `[${entry.level}] [${entry.category}] ${entry.message}`;
  if (entry.level === "ERROR" || entry.level === "EMERGENCY" || entry.level === "DANGER") {
    console.error(line, entry.meta ?? "");
  } else if (entry.level === "WARNING") {
    console.warn(line, entry.meta ?? "");
  } else {
    console.info(line, entry.meta ?? "");
  }

  return entry;
}

export function getSystemLogs(filter?: {
  level?: SystemLogLevel;
  limit?: number;
}): SystemLogEntry[] {
  const level = filter?.level;
  const limit = Math.max(1, Math.min(filter?.limit ?? 120, 400));

  const logs = getStore();
  const filtered = level ? logs.filter((item) => item.level === level) : logs;
  return filtered.slice(0, limit);
}
