import { ContentBlock } from "@/components/core/content-block";
import {
  ActionButton,
  DeleteButton,
  UpdateProfileButton,
} from "@/components/form/button";
import { EditableValue } from "@/components/form/editable-text";
import PageTitle from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { owner } from "@/lib/hooks/useOwner";
import { DateTime } from "@/lib/utils/datetime";
import { prisma } from "@/lib/utils/db";
import { getUpcomingInvoice } from "@/lib/utils/stripe";
import { clerkClient } from "@clerk/nextjs";
import Stripe from "stripe";
import {
  createSecretKey,
  redirectToBilling,
  revokeSecretKey,
  updateKeyName,
  updateRateLimit,
  updateSpendLimit,
} from "./actions";

export default async function Settings() {
  const { userId, ownerId } = owner();

  if (!ownerId || !userId) {
    throw new Error("User not found");
  }

  const [user, organization, secretKeys] = await Promise.all([
    clerkClient.users.getUser(userId),
    prisma.organization.findUnique({
      include: {
        stripe: true,
      },
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
  ]);

  const subscription = organization?.stripe
    ?.subscription as unknown as Stripe.Subscription;

  const invoice: Stripe.Invoice | null = organization?.stripe?.customerId
    ? await getUpcomingInvoice(organization?.stripe?.customerId)
    : null;

  return (
    <>
      <PageTitle title="Settings" />

      <ContentBlock>
        <main className="px-4 py-8 sm:px-6 lg:flex-auto">
          <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
                Account
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Manage your account settings and billing information.
              </p>

              <dl className="mt-6 space-y-6 divide-y border-t text-sm leading-6">
                <div className="pt-6 sm:flex">
                  <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                    Billing
                  </dt>
                  {subscription ? (
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900 dark:text-gray-200">
                        <Badge variant="default">
                          {subscription?.status.toUpperCase()}
                        </Badge>
                        {invoice?.amount_remaining && invoice?.period_end ? (
                          <p className="mt-2">
                            <span className="font-bold">Next Invoice:</span>
                            <span className="ml-2">
                              USD {(invoice.amount_remaining / 100).toFixed(2)}{" "}
                              on{" "}
                              {DateTime.fromSeconds(
                                invoice.period_end
                              ).toDateString()}
                            </span>
                          </p>
                        ) : null}
                        <div className="mt-2 flex items-center">
                          <span className="font-bold">
                            Monthly Spend Limit (USD):
                          </span>
                          <span className="ml-2">
                            <EditableValue
                              id={ownerId}
                              name="spendLimit"
                              type="number"
                              value={organization?.spendLimit ?? "-"}
                              action={updateSpendLimit}
                            />
                          </span>
                        </div>
                      </div>
                      <div className="text-gray-900 dark:text-gray-200">
                        <form action={redirectToBilling}>
                          <ActionButton
                            variant="link"
                            label="Manage"
                            loadingLabel="Redirecting..."
                          />
                        </form>
                      </div>
                    </dd>
                  ) : (
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900 dark:text-gray-200">
                        {organization?.credits ?? 0} credits left
                      </div>
                      <div className="text-gray-900 dark:text-gray-200">
                        <form action={redirectToBilling}>
                          <ActionButton
                            variant="link"
                            label="Upgrade"
                            loadingLabel="Redirecting to checkout..."
                          />
                        </form>
                      </div>
                    </dd>
                  )}
                </div>

                <div className="pt-6 sm:flex">
                  <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                    User name
                  </dt>
                  <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                    <div className="text-gray-900 dark:text-gray-200">
                      {user?.username || "Not set"}
                    </div>
                    <UpdateProfileButton />
                  </dd>
                </div>

                <div className="pt-6 sm:flex">
                  <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                    Full name
                  </dt>
                  <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                    <div className="text-gray-900 dark:text-gray-200">
                      {user?.firstName} {user?.lastName}
                    </div>
                  </dd>
                </div>

                {user?.emailAddresses?.length ? (
                  <div className="pt-6 sm:flex">
                    <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                      Email address
                    </dt>
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900 dark:text-gray-200">
                        {user?.emailAddresses[0].emailAddress}
                      </div>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </div>

          <div className="mt-16 mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
                API Credentials
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                Manage your API credentials. These keys should be kept secret
                and not shared publicly. You can find our API documentation{" "}
                <a
                  href="https://manageprompt.readme.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-semibold"
                >
                  here.
                </a>
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
                    <TableHead>Last used</TableHead>
                    <TableHead></TableHead>
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
                        {key.lastUsed
                          ? DateTime.fromJSDate(key.lastUsed).toNiceFormat()
                          : "Never"}
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
          </div>
        </main>
      </ContentBlock>
    </>
  );
}
