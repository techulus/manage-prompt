import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

export async function validateRateLimit(
  key: string,
  rateLimit: number,
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
}> {
  const rateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(rateLimit, "1 s"),
    prefix: "mp_ratelimit",
  });

  const { success, limit, remaining } = await rateLimiter.limit(key);

  return { success, limit, remaining };
}
