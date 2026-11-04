/**
 * Small fixed-window rate limiter, kept in memory.
 *
 * Each serverless instance has its own memory, so this is a per-instance
 * limit, not a global one. It stops a single client from hammering a warm
 * instance (Vercel reuses instances heavily), which is the cheap, common
 * abuse case. For a hard global cap, add a Vercel Firewall rate-limit rule
 * on the same path (see README → Security).
 */

type Window = { start: number; count: number };

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const windows = new Map<string, Window>();

  return function check(key: string, now = Date.now()) {
    // Opportunistic cleanup so the map cannot grow without bound.
    if (windows.size > 10_000) {
      windows.forEach((w, k) => {
        if (now - w.start >= windowMs) windows.delete(k);
      });
    }

    const current = windows.get(key);
    if (!current || now - current.start >= windowMs) {
      windows.set(key, { start: now, count: 1 });
      return { ok: true, retryAfterSeconds: 0 };
    }

    current.count += 1;
    if (current.count > limit) {
      return {
        ok: false,
        retryAfterSeconds: Math.ceil((current.start + windowMs - now) / 1000),
      };
    }
    return { ok: true, retryAfterSeconds: 0 };
  };
}

/** Best-effort client IP from Vercel / proxy headers. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
