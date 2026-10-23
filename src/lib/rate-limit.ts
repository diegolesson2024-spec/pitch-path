// Simple in-memory limiter for login and form attempts. Swap for Redis when running multiple servers.
const hits = new Map<string, { count: number; resetAt: number }>();

function prune(now: number) {
  for (const [key, entry] of hits) if (entry.resetAt < now) hits.delete(key);
}

export function rateLimit(key: string, limit = 8, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  if (hits.size > 5000) prune(now); // keep memory bounded under attack
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  entry.count += 1;
  return { ok: entry.count <= limit, retryInMin: Math.ceil((entry.resetAt - now) / 60000) };
}
