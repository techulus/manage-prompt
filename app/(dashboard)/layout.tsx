import NavBar from "@/components/console/navbar";

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
          <div className="min-h-screen lg:min-w-0 lg:flex-1 pb-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
