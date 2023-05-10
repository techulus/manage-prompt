"use client";

import {
  OrganizationSwitcher,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Disclosure } from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";
import { Bars3CenterLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import Link from "next/link";

const navigation = [
  { name: "Workflows", href: "/console/workflows", current: true },
  { name: "Settings", href: "/console/settings", current: false },
];

export default function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SignedIn>
        <div
          className="fixed left-0 top-0 h-full w-1/2 bg-white"
          aria-hidden="true"
        />
        <div
          className="fixed right-0 top-0 h-full w-1/2 bg-gray-50"
          aria-hidden="true"
        />
        <div className="relative flex min-h-full flex-col">
          {/* Navbar */}
          <Disclosure as="nav" className="flex-shrink-0 bg-blue-600">
            {({ open }) => (
              <>
                <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
                  <div className="relative flex h-16 items-center justify-between">
                    {/* Logo section */}
                    <div className="flex items-center px-2 lg:px-0 xl:w-64">
                      <div className="flex-shrink-0">
                        <p className="text-white">
                          Manage<span className="font-semibold">Prompt</span>
                        </p>
                      </div>
                    </div>

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
                          <XMarkIcon
                            className="block h-6 w-6"
                            aria-hidden="true"
                          />
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

          {/* 3 column wrapper */}
          <div className="mx-auto w-full max-w-7xl flex-grow lg:flex xl:px-8">
            {/* Left sidebar & main wrapper */}
            <div className="min-w-0 flex-1 bg-white xl:flex">
              {/* Account profile */}
              <div className="bg-white xl:w-64 xl:flex-shrink-0 xl:border-r xl:border-gray-200 z-10">
                <div className="py-6 pl-4 pr-6 sm:pl-6 lg:pl-8 xl:pl-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-8">
                      <div className="space-y-8 sm:flex sm:items-center sm:justify-between sm:space-y-0 xl:block xl:space-y-8">
                        {/* Profile */}
                        <SignedIn>
                          <div className="flex items-center space-x-3">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <OrganizationSwitcher afterSwitchOrganizationUrl="/console/workflows" />
                              </div>
                            </div>
                          </div>
                        </SignedIn>
                        {/* Action buttons */}
                        <div className="flex flex-col sm:flex-row xl:flex-col">
                          <Link
                            href="/console/workflows/new"
                            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 xl:w-full"
                          >
                            New Workflow
                          </Link>
                          <button
                            type="button"
                            className="mt-3 inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-3 sm:mt-0 xl:ml-0 xl:mt-3 xl:w-full"
                          >
                            Invite Team
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Workflows List */}
              <div className="bg-white lg:min-w-0 lg:flex-1 border-r border-gray-200">
                {children}
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-gray-100">
          <div className="flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
              <div className="text-center">
                <h2 className="mt-6 text-center text-2xl font-extrabold text-gray-900">
                  Redirecting...
                </h2>
              </div>
            </div>
          </div>
        </div>
      </SignedOut>
    </>
  );
}
