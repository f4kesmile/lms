type RateLimitState = {
  count: number;
  resetAt: number;
};

type GlobalWithRateLimit = typeof globalThis & {
  __NUSA_BELAJAR_RATE_LIMIT__?: Map<string, RateLimitState>;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

function getStore(): Map<string, RateLimitState> {
  const globalWithRateLimit = globalThis as GlobalWithRateLimit;
  if (!globalWithRateLimit.__NUSA_BELAJAR_RATE_LIMIT__) {
    globalWithRateLimit.__NUSA_BELAJAR_RATE_LIMIT__ = new Map();
  }
  return globalWithRateLimit.__NUSA_BELAJAR_RATE_LIMIT__;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown-ip";
}

export function checkRateLimit(input: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const store = getStore();
  const now = Date.now();

  const existing = store.get(input.key);
  if (!existing || existing.resetAt <= now) {
    store.set(input.key, { count: 1, resetAt: now + input.windowMs });
    return {
      allowed: true,
      remaining: Math.max(input.limit - 1, 0),
      retryAfterMs: input.windowMs,
    };
  }

  existing.count += 1;
  store.set(input.key, existing);

  const remaining = Math.max(input.limit - existing.count, 0);
  return {
    allowed: existing.count <= input.limit,
    remaining,
    retryAfterMs: Math.max(existing.resetAt - now, 0),
  };
}
