// ponytail: in-memory, per-instance — reset tiap cold start/deploy.
// Upgrade ke Upstash Redis kalau perlu limit yang konsisten antar instance serverless.

type Options = {
  limit: number;
  windowMs: number;
  now?: () => number; // inject untuk test
};

export class RateLimiter {
  private hits = new Map<string, number[]>();
  private limit: number;
  private windowMs: number;
  private now: () => number;

  constructor({ limit, windowMs, now = Date.now }: Options) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.now = now;
  }

  check(key: string): { ok: boolean } {
    const now = this.now();
    const cutoff = now - this.windowMs;
    const timestamps = (this.hits.get(key) ?? []).filter((t) => t > cutoff);

    if (timestamps.length >= this.limit) {
      this.hits.set(key, timestamps);
      return { ok: false };
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);

    // Jaga memory: prune map kalau kebanyakan key
    if (this.hits.size > 10_000) {
      for (const [k, v] of this.hits) {
        if (v.every((t) => t <= cutoff)) this.hits.delete(k);
      }
    }

    return { ok: true };
  }
}
