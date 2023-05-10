import NavBar from "@/components/console/navbar";
import Sidebar from "@/components/console/sidebar";

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        className="fixed left-0 top-0 h-full w-1/2 bg-white"
        aria-hidden="true"
      />
      <div
        className="fixed right-0 top-0 h-full w-1/2 bg-gray-50"
        aria-hidden="true"
      />
      <div className="relative flex min-h-full flex-col">
        <NavBar />

        {/* 3 column wrapper */}
        <div className="mx-auto w-full max-w-7xl flex-grow lg:flex xl:px-8">
          {/* Left sidebar & main wrapper */}
          <div className="min-w-0 flex-1 bg-white xl:flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Workflows List */}
            <div className="bg-white lg:min-w-0 lg:flex-1 border-r border-gray-200">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
