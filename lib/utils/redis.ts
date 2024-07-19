import { Redis } from "@upstash/redis";

export const redis = Redis.fromEnv();

export const redisStore = Redis.fromEnv({
  automaticDeserialization: false,
});
