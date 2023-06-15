"use client"; // not ideal, but the clerk components are reloading too many times, and this is a quick fix

import NavBar from "@/components/console/navbar";

export const dynamic = "force-dynamic";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-col">
      <NavBar />

      <div className="mx-auto w-full flex-grow lg:flex">
        <div className="min-w-0 flex-1 xl:flex">
          <div className="lg:min-w-0 lg:flex-1 pb-12">{children}</div>
        </div>
      </div>
    </div>
  );
}
