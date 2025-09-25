import PageSection from "@/components/core/page-section";
import { ManagePasskeys } from "@/components/core/passkeys";
import { ActionButton, DeleteButton } from "@/components/form/button";
import { EditableValue } from "@/components/form/editable-text";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUser, owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { notFound } from "next/navigation";
import {
  createSecretKey,
  revokeSecretKey,
  revokeUserKey,
  updateKeyName,
  updateRateLimit,
  updateUserKey,
  updateUserName,
} from "./actions";

export default async function Settings() {
  const { userId, ownerId } = await owner();

  const [user, organization, secretKeys, userKeys] = await Promise.all([
    getUser(),
    prisma.organization.findUnique({
      where: {
        id: ownerId,
      },
    }),
    prisma.secretKey.findMany({
      where: {
        organization: {
          id: {
            equals: ownerId,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.userKey.findMany({
      where: {
        organization: {
          id: {
            equals: ownerId,
          },
        },
      },
    }),
  ]);

  if (!user) {
    return notFound();
  }

  const userOpenRouterKey = userKeys.find((k) => k.provider === "openrouter");

  return (
    <>
      <PageTitle title="Settings" />

      <PageSection topInset>
        <div className="mx-auto max-w-2xl space-y-16 lg:mx-0 lg:max-w-none p-6">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
              Account
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              Manage your account settings and billing information.
            </p>

            <dl className="mt-6 space-y-4 divide-y border-t text-sm leading-6">
              <div className="pt-2 sm:flex">
                <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                  Credits
                </dt>
                <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                  <div className="flex items-center gap-2 text-gray-900 dark:text-gray-200">
                    {organization?.credits.toLocaleString() ?? 0} credits left
                    <a
                      href="mailto:support@manageprompt.com?subject=Request%20More%20Credits"
                      className={buttonVariants({
                        variant: "link",
                        className: "ml-2",
                        size: "sm",
                      })}
                    >
                      Request More
                    </a>
                  </div>
                </dd>
              </div>

              <div className="pt-2 sm:flex">
                <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                  Name
                </dt>
                <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                  <div className="text-gray-900 dark:text-gray-200">
                    <EditableValue
                      id={userId}
                      name="userName"
                      type="text"
                      value={user?.name ?? ""}
                      action={updateUserName}
                    />
                  </div>
                </dd>
              </div>

              {user?.email ? (
                <div className="pt-2 sm:flex">
                  <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                    Email address
                  </dt>
                  <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                    <div className="text-gray-900 dark:text-gray-200">
                      {user?.email}
                    </div>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </PageSection>

      <PageSection className="overflow-y-scroll">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none p-6">
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
            Setup Model Providers
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            Use your API keys to authenticate with AI providers.
          </p>

          <dl className="mt-6 space-y-4 divide-y border-t text-sm leading-6">
            <div className="pt-2 sm:flex">
              <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                OpenRouter
              </dt>
              <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                <div className="text-gray-900 dark:text-gray-200">
                  {userOpenRouterKey ? (
                    <form className="inline-block" action={revokeUserKey}>
                      <input type="hidden" name="provider" value="openrouter" />
                      <DeleteButton label="Remove" size="sm" />
                    </form>
                  ) : (
                    <EditableValue
                      id="openrouter"
                      name="apiKey"
                      type="text"
                      value={userOpenRouterKey ? "*******" : "-"}
                      action={updateUserKey}
                    />
                  )}
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </PageSection>

      <PageSection className="overflow-y-scroll">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none p-6">
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
            API Credentials
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            These keys should be kept secret and not shared publicly. You can
            read more about our API and rate limting{" "}
            <a
              href="https://manageprompt.readme.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-semibold"
            >
              here.
            </a>
            <br />
            You can revoke a key at any time if you believe it has been
            compromised.
          </p>

          <Table className="mt-6">
            {!secretKeys.length ? (
              <TableCaption>
                You have not created any secret keys yet.
                <form action={createSecretKey}>
                  <ActionButton
                    variant="link"
                    label="Generate Key"
                    loadingLabel="Creating..."
                  />
                </form>
              </TableCaption>
            ) : (
              <TableCaption>
                You can create multiple secret keys to use with the API.
                <form action={createSecretKey}>
                  <ActionButton
                    variant="link"
                    label="Create Key"
                    loadingLabel="Creating..."
                  />
                </form>
              </TableCaption>
            )}
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Rate Limit (Req/sec)</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {secretKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell>
                    <EditableValue
                      id={key.id}
                      name="keyName"
                      type="text"
                      value={key.name ?? "-"}
                      action={updateKeyName}
                    />
                  </TableCell>
                  <TableCell>
                    <pre>{key.key}</pre>
                  </TableCell>
                  <TableCell>
                    <EditableValue
                      id={key.id}
                      name="rateLimitPerSecond"
                      type="number"
                      value={key.rateLimitPerSecond}
                      action={updateRateLimit}
                    />
                  </TableCell>
                  <TableCell>
                    <form action={revokeSecretKey}>
                      <input type="hidden" name="id" value={key.id} />
                      <DeleteButton label="Revoke" />
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </PageSection>

      <ManagePasskeys />
    </>
  );
}
