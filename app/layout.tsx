import { ClerkProvider } from "@clerk/nextjs";

import "./globals.css";
import { SITE_METADATA } from "@/data/marketing";

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
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className="h-full">{children}</body>
      </html>
    </ClerkProvider>
  );
}
