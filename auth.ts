import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Postmark from "next-auth/providers/postmark";
import { prisma } from "./lib/utils/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Postmark({
      from: process.env.AUTH_FROM_EMAIL!,
    }),
  ],
  pages: {
    signIn: "/sign-in",
    newUser: "/start",
  },
});
