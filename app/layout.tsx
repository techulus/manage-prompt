import { ClerkProvider } from "@clerk/nextjs/app-beta";
import { Analytics } from "@vercel/analytics/react";

import { SITE_METADATA } from "@/data/marketing";
import "./globals.css";

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
      <ClerkProvider>
        <body className="h-full">{children}</body>
        <Analytics />
      </ClerkProvider>
    </html>
  );
}
