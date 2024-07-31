import NavBar from "@/components/console/navbar";

export const fetchCache = "force-no-store"; // disable cache for console pages
export const dynamic = "force-dynamic"; // disable static generation for console pages

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
          <div className="lg:min-w-0 lg:flex-1 pb-12 bg-gray-50 dark:bg-card min-h-screen">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
