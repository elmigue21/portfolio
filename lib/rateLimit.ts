// In-memory rate limiter for the chatbot. No database, so nothing external can
// go down and take the chatbot with it.
//
// It's best-effort: counts live in this server instance's memory, so they reset
// when Vercel starts a fresh instance and aren't shared between instances. The
// Vercel firewall rule on /api/ask is the main per-IP limit; this is the second
// layer (and the only one when running locally).

type Window = { limit: number; windowMs: number; message: string };

const WINDOWS: Window[] = [
  { limit: 5, windowMs: 10_000, message: "Too many requests. Please wait a few seconds." },
  { limit: 15, windowMs: 24 * 60 * 60 * 1000, message: "Daily limit reached. Try again tomorrow." },
];
const LONGEST_MS = Math.max(...WINDOWS.map((w) => w.windowMs));
const SWEEP_EVERY_MS = 10 * 60 * 1000;

// Request timestamps per IP, newest last. At most one day's worth is kept.
const hits = new Map<string, number[]>();
let lastSweep = 0;

export type RateLimitResult =
  | { ok: true }
  | { ok: false; message: string; retryAfterSec: number };

export function checkRateLimit(key: string, now = Date.now()): RateLimitResult {
  sweep(now);
  const recent = (hits.get(key) ?? []).filter((t) => now - t < LONGEST_MS);

  for (const w of WINDOWS) {
    const inWindow = recent.filter((t) => now - t < w.windowMs);
    if (inWindow.length >= w.limit) {
      hits.set(key, recent);
      const retryAfterSec = Math.ceil((inWindow[0] + w.windowMs - now) / 1000);
      return { ok: false, message: w.message, retryAfterSec };
    }
  }

  recent.push(now);
  hits.set(key, recent);
  return { ok: true };
}

// Drop IPs with no requests in the last day so memory stays small.
function sweep(now: number) {
  if (now - lastSweep < SWEEP_EVERY_MS) return;
  lastSweep = now;
  for (const [key, times] of hits) {
    if (!times.length || now - times[times.length - 1] >= LONGEST_MS) hits.delete(key);
  }
}

// The visitor's IP as Vercel reports it.
export function clientIp(headers: Headers): string {
  return (
    headers.get("x-real-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
