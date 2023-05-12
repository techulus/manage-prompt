import { SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav
        className="flex items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">ManagePrompt</span>
            <p className="text-black hero relative">
              Manage<span className="font-semibold">Prompt</span>
              <sup className="absolute top-0 left-[calc(100%+.1rem)] text-xs text-black">
                [alpha]
              </sup>
            </p>
          </Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <SignedIn>
            <a
              href="/console/workflows"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Console <span aria-hidden="true">&rarr;</span>
            </a>
          </SignedIn>
          <SignedOut>
            <a
              href="/console/workflows"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </a>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}
