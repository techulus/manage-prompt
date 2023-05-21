"use client";

import {
  OrganizationSwitcher,
  SignedIn,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { Disclosure } from "@headlessui/react";
import { Bars3CenterLeftIcon, XMarkIcon } from "@heroicons/react/20/solid";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import logo from "../../public/images/logo.png";

const navigation = [
  { name: "Workflows", href: "/console/workflows", current: true },
  { name: "Settings", href: "/console/settings", current: false },
];

export default function NavBar({ isPublicPage = false }) {
  const { isLoaded, user } = useUser();

  useEffect(() => {
    if (isPublicPage) {
      return;
    }

    if (isLoaded && !user) {
      window.location.href = "/";
    }
  }, [user, isLoaded, isPublicPage]);

  return (
    <Disclosure
      as="nav"
      className="flex-shrink-0 border-b border-gray-200 dark:border-gray-800 text-black dark:text-white"
    >
      {({ open }) => (
        <>
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

                <OrganizationSwitcher afterSwitchOrganizationUrl="/console/workflows" />
              </div>

              <div className="flex lg:hidden ml-2 justify-center">
                <UserButton />
              </div>

              <div className="flex lg:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon
                      className="block h-6 w-6 dark:text-gray-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <Bars3CenterLeftIcon
                      className="block h-6 w-6 dark:text-gray-500"
                      aria-hidden="true"
                    />
                  )}
                </Disclosure.Button>
              </div>
              {/* Links section */}
              <SignedIn>
                <div className="hidden lg:block lg:w-80">
                  <div className="flex items-center justify-end">
                    <div className="flex">
                      {navigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="rounded-md px-3 py-2 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="relative ml-4 flex-shrink-0">
                      <UserButton />
                    </div>
                  </div>
                </div>
              </SignedIn>
            </div>
          </div>

          <Disclosure.Panel className="lg:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "text-gray-800 bg-gray-50"
                      : "text-gray-800 hover:bg-gray-100 hover:text-black",
                    item.current
                      ? "dark:text-gray-200 dark:bg-gray-800"
                      : "dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-white",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
