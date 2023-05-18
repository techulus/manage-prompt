import { DeleteButton, UpdateProfileButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { prisma } from "@/utils/db";
import { auth, clerkClient } from "@clerk/nextjs/app-beta";
import { purgeWorkflowData } from "./actions";

export const dynamic = "force-dynamic";

export default async function Settings() {
  const { userId, orgId } = auth();
  const user = await clerkClient.users.getUser(userId ?? "");

  const dataCount = await prisma.workflow.count({
    where: { ownerId: orgId ?? userId ?? "" },
  });

  return (
    <>
      <PageTitle title="Settings" />

      <main className="px-4 py-8 sm:px-6 lg:flex-auto">
        <div className="mx-auto max-w-2xl space-y-16 sm:space-y-20 lg:mx-0 lg:max-w-none">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Profile
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              Your full name / user name will be displayed publicly when you
              share workflows.
            </p>

            <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
              <div className="pt-6 sm:flex">
                <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
                  User name
                </dt>
                <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                  <div className="text-gray-900">
                    {user?.username || "Not set"}
                  </div>
                  <UpdateProfileButton />
                </dd>
              </div>

              <div className="pt-6 sm:flex">
                <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
                  Full name
                </dt>
                <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                  <div className="text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                </dd>
              </div>

              {user?.emailAddresses?.length ? (
                <div className="pt-6 sm:flex">
                  <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
                    Email address
                  </dt>
                  <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                    <div className="text-gray-900">
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
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              Data
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-500">
              You can request all workflow data to be deleted, this does not
              delete your user account.
            </p>

            <dl className="mt-6 space-y-6 divide-y divide-gray-100 border-t border-gray-200 text-sm leading-6">
              <div className="pt-6 sm:flex">
                <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
                  Workflow data
                </dt>
                <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                  <div className="text-gray-900">{dataCount} workflow(s)</div>
                </dd>
              </div>

              <div className="pt-6 sm:flex">
                <dt className="font-medium text-gray-900 sm:w-64 sm:flex-none sm:pr-6">
                  Delete workflows
                </dt>
                <dd className="mt-1 flex justify-between gap-x-6 sm:mt-0 sm:flex-auto">
                  <p className="mt-1 text-sm leading-6 text-red-500 font-bold">
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
    </>
  );
}
