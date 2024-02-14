"use client";

import NavBar from "@/components/console/navbar";
import { useTheme } from "@/lib/hooks/useTheme";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <div className="relative flex min-h-full flex-col">
      <NavBar appearance={theme} />

      <div className="mx-auto w-full flex-grow lg:flex">
        <div className="min-w-0 flex-1 xl:flex">
          <div className="lg:min-w-0 lg:flex-1 pb-12 bg-gray-50 dark:bg-card min-h-screen">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
