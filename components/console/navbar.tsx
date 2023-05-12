"use client";

import { UserButton } from "@clerk/nextjs";
import { Disclosure } from "@headlessui/react";
import {
  Bars3CenterLeftIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid";
import classNames from "classnames";
import Link from "next/link";

const navigation = [
  { name: "Workflows", href: "/console/workflows", current: true },
  { name: "Settings", href: "/console/settings", current: false },
];

export default function NavBar() {
  return (
    <Disclosure as="nav" className="flex-shrink-0 bg-blue-600">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              {/* Logo section */}
              <Link href="/" className="text-white hero">
                <div className="flex items-center px-2 lg:px-0 xl:w-64">
                  <div className="flex-shrink-0 relative">
                    Manage<span className="font-semibold">Prompt</span>
                    <sup className="absolute top-0 left-[calc(100%+.1rem)] text-xs text-blue">
                      [alpha]
                    </sup>
                  </div>
                </div>
              </Link>

              {/* Search section */}
              <div className="flex flex-1 justify-center lg:justify-end">
                <div className="w-full px-2 lg:px-6">
                  <label htmlFor="search" className="sr-only">
                    Search workflows
                  </label>
                  <div className="relative text-blue-200 focus-within:text-gray-400">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <MagnifyingGlassIcon
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="search"
                      name="search"
                      className="block w-full rounded-md border-0 bg-blue-400 bg-opacity-25 py-1.5 pl-10 pr-3 text-blue-100 placeholder:text-blue-200 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-0 focus:placeholder:text-gray-400 sm:text-sm sm:leading-6"
                      placeholder="Search Workflows"
                      type="search"
                    />
                  </div>
                </div>
              </div>
              <div className="flex lg:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-blue-600 p-2 text-blue-400 hover:bg-blue-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3CenterLeftIcon
                      className="block h-6 w-6"
                      aria-hidden="true"
                    />
                  )}
                </Disclosure.Button>
              </div>
              {/* Links section */}
              <div className="hidden lg:block lg:w-80">
                <div className="flex items-center justify-end">
                  <div className="flex">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="rounded-md px-3 py-2 text-sm font-medium text-blue-200 hover:text-white"
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
                      ? "bg-blue-800 text-white"
                      : "text-blue-200 hover:bg-blue-600 hover:text-blue-100",
                    "block rounded-md px-3 py-2 text-base font-medium"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="border-t border-blue-800 pb-3 pt-4">
              <div className="space-y-1 px-2 pl-4">
                <UserButton />
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
