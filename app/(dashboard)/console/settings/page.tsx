import PageSection from "@/components/core/page-section";
import { ActionButton, DeleteButton } from "@/components/form/button";
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
import { getUser, owner } from "@/lib/hooks/useOwner";
import { DateTime } from "@/lib/utils/datetime";
import { prisma } from "@/lib/utils/db";
import {
  getUpcomingInvoice,
  isSubscriptionCancelled,
} from "@/lib/utils/stripe";
import { CheckBadgeIcon } from "@heroicons/react/20/solid";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import {
  createSecretKey,
  redirectToBilling,
  removeSpendLimit,
  revokeSecretKey,
  revokeUserKey,
  updateKeyName,
  updateRateLimit,
  updateSpendLimit,
  updateUserKey,
  updateUserName,
} from "./actions";

export default async function Settings() {
  const { userId, ownerId } = await owner();
  if (!ownerId || !userId) {
    throw new Error("User not found");
  }

  const [user, organization, secretKeys, userKeys] = await Promise.all([
    getUser(),
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

  const subscription = organization?.stripe
    ?.subscription as unknown as Stripe.Subscription;

  const invoice: Stripe.Invoice | null = organization?.stripe?.customerId
    ? await getUpcomingInvoice(organization?.stripe?.customerId)
    : null;

  const userOpenAIKey = userKeys.find((k) => k.provider === "openai");

  return (
    <>
      <PageTitle title="Settings" />

      <PageSection topInset>
        <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none p-6">
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
                  <div className="text-gray-900 dark:text-gray-200">
                    {organization?.credits.toLocaleString() ?? 0} credits left
                  </div>
                  {!subscription ? (
                    <div className="text-gray-900 dark:text-gray-200">
                      <form action={redirectToBilling}>
                        <ActionButton
                          variant="link"
                          label="Upgrade"
                          loadingLabel="Redirecting to checkout..."
                        />
                      </form>
                    </div>
                  ) : null}
                </dd>
              </div>

              <div className="pt-2 sm:flex">
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
                            USD {(invoice.amount_remaining / 100).toFixed(2)} on{" "}
                            {DateTime.fromSeconds(
                              invoice.period_end,
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
                        {organization?.spendLimit ? (
                          <form action={removeSpendLimit}>
                            <input type="hidden" name="id" value={ownerId} />
                            <ActionButton
                              className="p-0 m-0 h-5"
                              variant="link"
                              label="Remove"
                              loadingLabel="Removing..."
                            />
                          </form>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-gray-900 dark:text-gray-200">
                      <form action={redirectToBilling}>
                        <ActionButton
                          variant="link"
                          label={
                            isSubscriptionCancelled(subscription)
                              ? "Upgrade"
                              : "Manage"
                          }
                          loadingLabel="Redirecting..."
                        />
                      </form>
                    </div>
                  </dd>
                ) : null}
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

      <PageSection className="overflow-y-scroll">
        <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none p-6">
          <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
            Bring your own key (beta)
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            If you have your own API key, you can use it to authenticate with AI
            providers. We currently support OpenAI. (GROQ and Anthropic coming
            soon)
          </p>

          <dl className="mt-6 space-y-4 divide-y border-t text-sm leading-6">
            <div className="pt-2 sm:flex">
              <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                OpenAI
              </dt>
              <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                <div className="text-gray-900 dark:text-gray-200">
                  {userOpenAIKey ? (
                    <CheckBadgeIcon className="h-6 w-6 text-green-500" />
                  ) : (
                    <EditableValue
                      id="openai"
                      name="apiKey"
                      type="text"
                      value={userOpenAIKey ? "*******" : "-"}
                      action={updateUserKey}
                    />
                  )}
                </div>

                {userOpenAIKey ? (
                  <form className="inline-block" action={revokeUserKey}>
                    <input type="hidden" name="provider" value="openai" />
                    <DeleteButton label="Remove" size="sm" />
                  </form>
                ) : null}
              </dd>
            </div>
          </dl>
        </div>
      </PageSection>
    </>
  );
}
