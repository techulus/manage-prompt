"use client";

import { useDetectSticky } from "@/lib/hooks/useDetectSticky";
import { cn } from "@/lib/utils";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import logo from "../../public/images/logo.png";
import { UserButton } from "../core/auth";
import { createToastWrapper } from "../core/toast";

type Props = {
  isPublicPage?: boolean;
};

export default function NavBar({ isPublicPage = false }: Props) {
  const { systemTheme: theme } = useTheme();
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
        name: "Chatbots",
        href: "/console/chatbots",
        current: path.startsWith("/console/chatbots"),
      },
      {
        name: "Settings",
        href: "/console/settings",
        current: path === "/console/settings",
      },
    ],
    [path],
  );

  return (
    <>
      {createToastWrapper(theme)}
      <nav
        className={cn(
          "flex-shrink-0 text-black dark:text-white",
          isPublicPage && "border-b",
        )}
      >
        <div className="mx-auto px-4 lg:px-8">
          <div className="relative flex h-16 items-center justify-between">
            <div className="flex">
              <Link href="/" className="ml-1" prefetch={false}>
                <div className="flex items-center lg:px-0">
                  <Image
                    src={logo}
                    alt="ManagePrompt"
                    width={32}
                    height={32}
                    className="mr-2"
                  />

                  <div className="-m-1.5 p-1.5">
                    <span className="sr-only">ManagePrompt</span>
                    <p className="text-hero relative">
                      Manage<span className="font-semibold">Prompt</span>
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {!isPublicPage ? (
              <div className="flex ml-2 justify-center">
                <UserButton />
              </div>
            ) : null}
          </div>
        </div>
      </nav>

      <div
        className={classNames(
          "flex px-4 lg:px-8 min-w-full bg-background border-b -mb-px self-start sticky -top-[1px] z-10",
          isSticky ? "pt-[1px] bg-red shadow-md" : "",
          isPublicPage ? "hidden" : "",
        )}
        ref={ref}
        aria-label="Tabs"
      >
        <Transition
          show={isSticky}
          className="absolute self-center"
          enter="transition-all ease-in-out duration-300"
          enterFrom="transform  translate-y-[-100%] opacity-0"
          enterTo="transform  translate-y-0 opacity-100"
          leave="transition-all ease-in-out duration-300"
          leaveFrom="transform  translate-y-0 opacity-100"
          leaveTo="transform  translate-y-[-100%] opacity-0"
        >
          <Link href="/" prefetch={false}>
            <Image src={logo} alt="ManagePrompt" width={24} height={24} />
          </Link>
        </Transition>

        <div
          className={classNames(
            "flex space-x-1 overflow-y-scroll",
            "transition ease-in-out duration-300",
            isSticky ? "translate-x-[40px]" : "translate-x-0",
          )}
        >
          {tabs.map((tab) => (
            <Link
              prefetch={false}
              key={tab.name}
              href={tab.href}
              className={classNames(
                tab.current
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 dark:text-gray-400",
                "whitespace-nowrap border-b-2 py-3 text-sm font-medium",
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
    </>
  );
}
