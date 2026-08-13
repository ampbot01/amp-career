import { describe, it, expect } from "vitest";
import { RateLimiter } from "./rate-limit";

describe("RateLimiter", () => {
  it("allows up to limit then blocks", () => {
    const rl = new RateLimiter({ limit: 3, windowMs: 60_000 });
    expect(rl.check("1.2.3.4").ok).toBe(true);
    expect(rl.check("1.2.3.4").ok).toBe(true);
    expect(rl.check("1.2.3.4").ok).toBe(true);
    expect(rl.check("1.2.3.4").ok).toBe(false);
  });

  it("tracks keys independently", () => {
    const rl = new RateLimiter({ limit: 1, windowMs: 60_000 });
    rl.check("a");
    expect(rl.check("b").ok).toBe(true);
  });

  it("frees capacity after window passes", () => {
    let now = 1_000_000;
    const rl = new RateLimiter({ limit: 1, windowMs: 1_000, now: () => now });
    expect(rl.check("a").ok).toBe(true);
    expect(rl.check("a").ok).toBe(false);
    now += 1_001;
    expect(rl.check("a").ok).toBe(true);
  });
});
