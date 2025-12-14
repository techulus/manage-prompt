import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { magicLink } from "better-auth/plugins";
import { passkey } from "better-auth/plugins/passkey";
import { ServerClient } from "postmark";
import { magicLinkEmail } from "@/components/emails/magic-link";
import { prisma } from "@/lib/utils/db";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const { plainText, html } = magicLinkEmail(url);
        const emailClient = new ServerClient(process.env.AUTH_POSTMARK_KEY!);
        await emailClient.sendEmail({
          From: process.env.AUTH_FROM_EMAIL!,
          To: email,
          Subject: "Your Magic Link",
          TextBody: plainText,
          HtmlBody: html,
        });
      },
    }),
    passkey(
      process.env.NODE_ENV === "production"
        ? {
            rpID: "manageprompt.com",
            rpName: "ManagePrompt",
          }
        : undefined,
    ),
    nextCookies(),
  ],
  baseURL: process.env.APP_BASE_URL,
  trustedOrigins: [process.env.APP_BASE_URL!],
});
