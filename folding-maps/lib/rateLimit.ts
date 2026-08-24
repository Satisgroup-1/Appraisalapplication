/**
 * A best-effort submission limit, held in the instance's memory.
 *
 * This is deliberately modest about what it is: serverless instances are not
 * shared, so a determined sender who lands on cold instances gets more attempts
 * than the number below suggests. It exists to stop a script hammering one warm
 * instance, and it sits behind the honeypot rather than in front of it. For a
 * hard limit, put a rule at the edge (Vercel WAF, Cloudflare) instead.
 */

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

export const RATE_LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };

export function checkRateLimit(
  key: string,
  now: number,
  { max, windowMs } = RATE_LIMIT,
): { allowed: boolean; retryAfterSeconds: number } {
  // Opportunistic sweep: the map only ever holds keys seen in this instance,
  // and expired ones would otherwise accumulate for the life of the process.
  if (buckets.size > 500) {
    for (const [existing, window] of buckets) {
      if (window.resetAt <= now) buckets.delete(existing);
    }
  }

  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (current.count >= max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Test seam: the map is module state and would otherwise leak between cases. */
export function resetRateLimit() {
  buckets.clear();
}

/**
 * The client address, as far as it can be trusted. Behind a proxy the first
 * entry of x-forwarded-for is the client; without one there is no address, and
 * every request shares a single bucket, which is the safe direction to fail.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip')?.trim() || 'unknown';
}
