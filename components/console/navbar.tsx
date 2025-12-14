"use client";

import { Transition } from "@headlessui/react";
import Image from "next/image";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useMemo } from "react";
import { useDetectSticky } from "@/lib/hooks/useDetectSticky";
import { cn } from "@/lib/utils";
import logo from "../../public/images/logo.png";
import { UserButton } from "../core/auth";

type Props = {
  isPublicPage?: boolean;
};

export default function NavBar({ isPublicPage = false }: Props) {
  const path = usePathname();
  const params = useParams();

  const [isSticky, ref] = useDetectSticky();

  const tabs = useMemo(() => {
    if ("workflowId" in params) {
      return [
        {
          name: "Editor",
          href: `/workflows/${params.workflowId}`,
          current:
            path === `/workflows/${params.workflowId}` ||
            path === `/workflows/${params.workflowId}/edit`,
        },
        {
          name: "Branches",
          href: `/workflows/${params.workflowId}/branches`,
          current:
            path === `/workflows/${params.workflowId}/branches` ||
            path === `/workflows/${params.workflowId}/branches/new`,
        },
        {
          name: "Tests",
          href: `/workflows/${params.workflowId}/tests`,
          current: path === `/workflows/${params.workflowId}/tests`,
        },
        {
          name: "Executions",
          href: `/workflows/${params.workflowId}/runs`,
          current: path === `/workflows/${params.workflowId}/runs`,
        },
        {
          name: "Usage",
          href: `/workflows/${params.workflowId}/usage`,
          current: path === `/workflows/${params.workflowId}/usage`,
        },
      ];
    }

    return [
      {
        name: "Workflows",
        href: "/workflows",
        current: path.startsWith("/workflows"),
      },
      {
        name: "Settings",
        href: "/settings",
        current: path === "/settings",
      },
    ];
  }, [path, params]);

  return (
    <>
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
                    <p className="relative">
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
        className={cn(
          "sticky -top-[1px] z-10 -mb-px flex w-screen self-start border-b bg-background px-4 lg:px-8",
          isSticky ? "pt-[1px] shadow-md" : "",
          isPublicPage ? "hidden" : "",
        )}
        ref={ref}
      >
        <Transition show={isSticky}>
          <Link
            className={cn(
              "absolute hidden self-center md:block top-[10px]",
              "data-[enter]:data-[leave]:transition-all ease-in-out duration-300",
              "data-[enterFrom]:data-[leaveTo]:transform translate-y-[-100%] opacity-0",
              "data-[enterTo]:data-[leaveFrom]:transform translate-y-0 opacity-100",
            )}
            href="/"
            prefetch={false}
          >
            <Image
              className="rounded-md"
              src={logo}
              alt="ManagePrompt"
              width={24}
              height={24}
            />
          </Link>
        </Transition>

        <div
          className={cn(
            "hidden-scrollbar flex space-x-1 overflow-y-scroll transition duration-300 ease-in-out",
            isSticky ? "md:translate-x-[40px]" : "md:translate-x-0",
          )}
        >
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                tab.current
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 dark:text-gray-400",
                "whitespace-nowrap border-b-2 py-3 text-sm font-medium",
              )}
              aria-current={tab.current ? "page" : undefined}
              prefetch={false}
            >
              <span className="rounded-md px-4 py-2 transition duration-300 ease-in-out hover:bg-gray-100 hover:text-black dark:hover:bg-gray-800 dark:hover:text-white">
                {tab.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
