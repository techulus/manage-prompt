import { neonConfig, Pool, PoolConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

// types
declare global {
  var prisma: PrismaClient | undefined;
}

// setup
neonConfig.webSocketConstructor = ws;
const poolConfig: PoolConfig = { connectionString: process.env.DATABASE_URL };

// instantiate
const pool = new Pool(poolConfig); // log:console.log?
const adapter = new PrismaNeon(pool);

export const prisma =
  global.prisma ||
  new PrismaClient({ adapter, log: ["info", "warn", "error"] });

// cache on global for HOT RELOAD in dev
if (process.env.NODE_ENV === "development") global.prisma = prisma;
