import { ClerkProvider } from "@clerk/nextjs/app-beta";
import { Analytics } from "@vercel/analytics/react";
import { Fira_Sans } from "next/font/google";

import { SITE_METADATA } from "@/data/marketing";
import classNames from "classnames";
import "./globals.css";

const firaSans = Fira_Sans({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
});

export const metadata = {
  title: SITE_METADATA.TITLE,
  description: SITE_METADATA.DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="flex min-w-full min-h-full bg-black">
      <link rel="manifest" href="/manifest.json" />

      <ClerkProvider>
        <body
          className={classNames(
            "flex-1 min-h-full min-w-full bg-white dark:bg-gray-900",
            "rounded-tl-xl rounded-tr-xl md:rounded-none",
            firaSans.className
          )}
        >
          {children}
        </body>
        <Analytics />
      </ClerkProvider>
    </html>
  );
}
