import NavBar from "@/components/console/navbar";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = cookies().get("theme")?.value ?? "light";

  return (
    <div className="relative flex min-h-full flex-col">
      <NavBar isPublicPage appearance={theme} />

      <div className="mx-auto w-full flex-grow lg:flex">
        <div className="min-w-0 flex-1 xl:flex">
          <div className="lg:min-w-0 lg:flex-1 pb-12">{children}</div>
        </div>
      </div>
    </div>
  );
}
