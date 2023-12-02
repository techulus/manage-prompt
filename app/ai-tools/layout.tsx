"use client";

import NavBar from "@/components/console/navbar";
import { Footer } from "@/components/layout/footer";
import { useTheme } from "@/lib/hooks/useTheme";

export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <div className="relative flex min-h-full flex-col">
      <NavBar isPublicPage appearance={theme} />

      <div className="mx-auto w-full flex-grow lg:flex">
        <div className="min-w-0 flex-1 xl:flex">
          <div className="lg:min-w-0 lg:flex-1 pb-0 md:pb-12 bg-gray-50 dark:bg-gray-900">
            {children}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
