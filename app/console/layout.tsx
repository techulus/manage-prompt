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

      <div className="mx-auto w-full max-w-7xl flex-grow lg:flex xl:px-8">
        <div className="min-w-0 flex-1 xl:flex">
          <div className="lg:min-w-0 lg:flex-1 lg:border-l lg:border-r border-gray-200 dark:border-gray-800 pb-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
