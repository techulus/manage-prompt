"use client";

import { useDetectSticky } from "@/lib/hooks/useDetectSticky";
import { SignedIn, useUser } from "@clerk/nextjs";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo } from "react";
import logo from "../../public/images/logo.png";
import { ThemedOrgSwitcher, ThemedUserButton } from "../core/auth";

type Props = {
  isPublicPage?: boolean;
  appearance: string;
};

export default function NavBar({ isPublicPage = false, appearance }: Props) {
  const { isLoaded, user } = useUser();
  const path = usePathname();

  const [isSticky, ref] = useDetectSticky();

  const tabs = useMemo(
    () => [
      {
        name: "Workflows",
        href: "/console/workflows",
        current: path.startsWith("/console/workflows"),
      },
      {
        name: "Chat",
        href: "/console/chat",
        current: path.startsWith("/console/chat"),
      },
      // {
      //   name: "Writer",
      //   href: "/console/writer",
      //   current: path.startsWith("/console/writer"),
      // },
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
    <>
      <nav className="flex-shrink-0 text-black dark:text-white">
        <div className="mx-auto px-4 lg:px-8">
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

              <SignedIn>
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
              </SignedIn>

              <ThemedOrgSwitcher appearance={appearance} />
            </div>

            <div className="flex ml-2 justify-center">
              <ThemedUserButton appearance={appearance} />
            </div>
          </div>
        </div>
      </nav>

      <SignedIn>
        <div
          className={classNames(
            "flex px-4 lg:px-8 min-w-full bg-background border-b border-gray-200 dark:border-gray-800 -mb-px self-start sticky -top-[1px] z-10",
            isSticky ? "pt-[1px] bg-red shadow-md" : ""
          )}
          ref={ref}
          aria-label="Tabs"
        >
          <Transition
            show={isSticky}
            className="absolute self-center"
            enter="transition-all ease-in-out duration-[250ms]"
            enterFrom="transform  translate-y-[-100%] opacity-0"
            enterTo="transform  translate-y-0 opacity-100"
            leave="transition-all ease-in-out duration-[250ms]"
            leaveFrom="transform  translate-y-0 opacity-100"
            leaveTo="transform  translate-y-[-100%] opacity-0"
          >
            <Link href="/">
              <Image src={logo} alt="ManagePrompt" width={24} height={24} />
            </Link>
          </Transition>

          <div
            className={classNames(
              "flex space-x-1 overflow-y-scroll",
              "transition ease-in-out duration-300",
              isSticky ? "translate-x-[40px]" : "translate-x-0"
            )}
          >
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                href={tab.href}
                className={classNames(
                  tab.current
                    ? "border-blue-500 text-blue-600 dark:text-blue-500"
                    : "border-transparent text-gray-500 dark:text-gray-400",
                  "whitespace-nowrap border-b-2 py-3 text-sm font-medium"
                )}
                aria-current={tab.current ? "page" : undefined}
              >
                <span className="transition ease-in-out duration-300 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-white hover:text-black py-2 px-4 rounded-md">
                  {tab.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </SignedIn>
    </>
  );
}
