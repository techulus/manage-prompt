import { ContentBlock } from "@/components/core/content-block";
import {
  ActionButton,
  DeleteButton,
  UpdateProfileButton,
} from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
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
import { prisma } from "@/lib/utils/db";
import { clerkClient } from "@clerk/nextjs";
import Stripe from "stripe";
import {
  createSecretKey,
  purgeWorkflowData,
  redirectToBilling,
  revokeSecretKey,
} from "./actions";

export default async function Settings() {
  const { userId, ownerId } = owner();

  if (!ownerId || !userId) {
    throw new Error("User not found");
  }

  const [user, organization, secretKeys, dataCount] = await Promise.all([
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
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      where: {
        organization: {
          id: {
            equals: ownerId,
          },
        },
      },
    }),
    prisma.workflow.count({
      where: {
        organization: {
          id: {
            equals: ownerId,
          },
        },
      },
    }),
  ]);

  const subscription = organization?.stripe
    ?.subscription as unknown as Stripe.Subscription;

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

              <dl className="mt-6 space-y-6 divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800 text-sm leading-6">
                <div className="pt-6 sm:flex">
                  <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                    Billing
                  </dt>
                  {subscription ? (
                    <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                      <div className="text-gray-900 dark:text-gray-200">
                        {subscription?.status.toUpperCase()}
                      </div>
                      <div className="text-gray-900 dark:text-gray-200">
                        <form action={redirectToBilling}>
                          <ActionButton
                            variant="default"
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
                            variant="default"
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
                Manage your API credentials. You can create multiple keys to use
                with the API. These keys should be kept secret and not shared
                publicly.
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
                ) : null}
                <TableHeader>
                  <TableRow>
                    <TableHead>Key</TableHead>
                    <TableHead>Created by</TableHead>
                    <TableHead>Last used</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {secretKeys.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>{key.key}</TableCell>
                      <TableCell>
                        {key.user.first_name} {key.user.last_name}
                      </TableCell>
                      <TableCell>
                        {key.lastUsed
                          ? new Date(key.lastUsed).toLocaleDateString()
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

          <div className="mt-16 mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
            <div>
              <h2 className="text-base font-semibold leading-7 text-gray-900 dark:text-gray-200">
                Data
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                You can request all workflow data to be deleted, this does not
                delete your user account.
              </p>

              <dl className="mt-6 space-y-6 divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-200 dark:border-gray-800 text-sm leading-6">
                <div className="pt-6 sm:flex">
                  <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                    Workflow data
                  </dt>
                  <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                    <div className="text-gray-900 dark:text-gray-200">
                      {dataCount} workflow(s)
                    </div>
                  </dd>
                </div>

                <div className="pt-6 sm:flex">
                  <dt className="font-medium text-gray-900 dark:text-gray-200 sm:w-64 sm:flex-none sm:pr-6">
                    Delete workflows
                  </dt>
                  <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                    <p className="mt-1 text-sm leading-6 text-red-500 dark:text-red-600 font-bold">
                      This action is permanent and cannot be undone.
                    </p>
                    <form action={purgeWorkflowData}>
                      <DeleteButton />
                    </form>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </main>
      </ContentBlock>
    </>
  );
}
