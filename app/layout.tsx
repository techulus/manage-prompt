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
    <html lang="en" className="h-full">
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link rel="manifest" href="/manifest.json" />

      <ClerkProvider>
        <body className={classNames("h-full", firaSans.className)}>
          {children}
        </body>
        <Analytics />
      </ClerkProvider>
    </html>
  );
}
