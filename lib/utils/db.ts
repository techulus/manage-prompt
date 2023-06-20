import { PrismaClient } from "@prisma/client";
import { PrismaClient as PrismaEdgeClient } from "@prisma/client/edge";

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export const prismaEdge = new PrismaEdgeClient({
  log: ["query", "info", "warn", "error"],
});
