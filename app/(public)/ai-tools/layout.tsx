import NavBar from "@/components/console/navbar";
import { Footer } from "@/components/layout/footer";

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-full flex-col">
      <NavBar isPublicPage />

      <div className="mx-auto w-full flex-grow lg:flex">
        <div className="min-w-0 flex-1 xl:flex">
          <div className="lg:min-w-0 lg:flex-1 pb-0 md:pb-12 bg-gray-50 dark:bg-card">
            {children}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
