"use client";

import { useUser } from "@clerk/nextjs";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import logo from "../../public/images/logo.png";
import { ThemedOrgSwitcher, ThemedUserButton } from "../core/auth";

export default function NavBar({ isPublicPage = false }) {
  const { isLoaded, user } = useUser();
  const path = usePathname();

  const tabs = useMemo(
    () => [
      {
        name: "Workflows",
        href: "/console/workflows",
        current: path.startsWith("/console/workflows"),
      },
      {
        name: "Settings",
        href: "/console/settings",
        current: path === "/console/settings",
      },
    ],
    [path]
  );

  useEffect(() => {
    if (isPublicPage) {
      return;
    }

    if (isLoaded && !user) {
      window.location.href = "/";
    }
  }, [user, isLoaded, isPublicPage]);

  return (
    <nav className="flex-shrink-0 border-b bg-white dark:bg-black border-gray-200 dark:border-gray-800 text-black dark:text-white">
      <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="flex">
            <Link href="/" className="ml-1">
              <div className="flex items-center lg:px-0">
                <div className="flex-shrink-0">
                  <Image
                    src={logo}
                    alt="ManagePrompt"
                    width={32}
                    height={32}
                    className="mr-2"
                  />
                </div>
              </div>
            </Link>

            <svg
              fill="none"
              height="32"
              shapeRendering="geometricPrecision"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1"
              viewBox="0 0 24 24"
              width="32"
              className="text-gray-300 dark:text-gray-700 xl:block mr-2"
            >
              <path d="M16.88 3.549L7.12 20.451"></path>
            </svg>

            <ThemedOrgSwitcher />
          </div>

          <div className="flex ml-2 justify-center">
            <ThemedUserButton />
          </div>
        </div>

        <nav
          className="-mb-px flex space-x-1 overflow-y-scroll"
          aria-label="Tabs"
        >
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={classNames(
                tab.current
                  ? "border-blue-500 text-blue-600 dark:text-blue-500"
                  : "border-transparent text-gray-500 dark:text-gray-400",
                "whitespace-nowrap border-b-2 py-2 text-sm font-medium"
              )}
              aria-current={tab.current ? "page" : undefined}
            >
              <span className="transition ease-in-out duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white hover:text-black py-2 px-4 rounded-md">
                {tab.name}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </nav>
  );
}
