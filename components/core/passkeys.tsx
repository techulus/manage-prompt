"use client";

import { authClient } from "@/lib/auth-client";
import type { Passkey } from "better-auth/plugins/passkey";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import PageSection from "./page-section";

export function ManagePasskeys() {
  const [passkeys, setPasskeys] = useState<Passkey[]>([]);

  const fetchPasskeys = useCallback(async () => {
    const { data, error } = await authClient.passkey.listUserPasskeys();
    if (error || !data) {
      console.error(error);
      return;
    }
    setPasskeys(data);
  }, []);

  useEffect(() => {
    fetchPasskeys();
  }, [fetchPasskeys]);

  return (
    <PageSection>
      <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none p-6">
        <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
          Passkeys
        </h2>
        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
          Passkeys are a secure way to authenticate with your account. They are
          supported on all major browsers and devices.
        </p>

        {!passkeys.length ? (
          <div className="p-4 sm:flex">
            <dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
              Setup your passkeys
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900 dark:text-gray-200">
                <Button
                  onClick={async () => {
                    await authClient.passkey.addPasskey();
                    await fetchPasskeys();
                  }}
                  className="max-w-[160px]"
                >
                  Add a Passkey
                </Button>
              </div>
            </dd>
          </div>
        ) : (
          <div className="py-4 sm:flex">
            <dt className="font-semibold text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
              Your passkeys
            </dt>
            <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
              <div className="text-gray-900 dark:text-gray-200">
                {passkeys.map((passkey) => (
                  <div
                    key={passkey.id}
                    className="flex justify-between items-center gap-2"
                  >
                    <Badge>Registered</Badge>
                    {passkey.id.substring(0, 7)}
                  </div>
                ))}
              </div>
            </dd>
          </div>
        )}
      </div>
    </PageSection>
  );
}
