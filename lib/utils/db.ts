import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

// types
declare global {
  var prisma: any;
}

export const prisma =
  global.prisma || new PrismaClient().$extends(withAccelerate());

// cache on global for HOT RELOAD in dev
if (process.env.NODE_ENV === "development") global.prisma = prisma;
