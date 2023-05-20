import NavBar from "@/components/console/navbar";

export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-col">
      <NavBar isPublicPage />

      <div className="mx-auto w-full max-w-7xl flex-grow lg:flex xl:px-8">
        <div className="min-w-0 flex-1 bg-white xl:flex">
          <div className="bg-white lg:min-w-0 lg:flex-1 border-l border-r border-gray-200 pb-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
