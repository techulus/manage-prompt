import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import logo from "../../public/images/logo.png";

const navigation = [
  {
    name: "Documentation",
    href: "https://manageprompt.readme.io/reference/run-workflow",
  },
  {
    name: "Support",
    href: "https://techulus.atlassian.net/servicedesk/customer/portal/5",
  },
];

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 text-black dark:text-white">
      <nav
        className="flex items-center justify-between p-6 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Image
            src={logo}
            alt="ManagePrompt"
            width={32}
            height={32}
            className="-mt-2 mr-2"
          />

          <Link href="/" className="-m-1.5 p-1.5" prefetch={false}>
            <span className="sr-only">ManagePrompt</span>
            <p className="hero relative">
              Manage<span className="font-semibold">Prompt</span>
            </p>
          </Link>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          {navigation.map((item) => (
            <a
              target="_blank"
              rel="noopener noreferrer"
              key={item.name}
              href={item.href}
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
            >
              {item.name}
            </a>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <SignedIn>
            <Link
              href="/console/workflows"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
              prefetch={false}
            >
              Console <span aria-hidden="true">&rarr;</span>
            </Link>
          </SignedIn>
          <SignedOut>
            <Link
              prefetch={false}
              href="/console/workflows"
              className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-200"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}
