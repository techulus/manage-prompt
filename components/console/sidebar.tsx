"use client";

import { OrganizationSwitcher, SignedIn } from "@clerk/nextjs";
import Link from "next/link";

export default function Sidebar() {
  return (
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
                {/* TODO */}
                {/* <button
                  type="button"
                  className="mt-3 inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:ml-3 sm:mt-0 xl:ml-0 xl:mt-3 xl:w-full"
                >
                  Invite Team
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
