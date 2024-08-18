import EmptyState from "@/components/core/empty-state";
import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import { Badge } from "@/components/ui/badge";
import { owner } from "@/lib/hooks/useOwner";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/utils/db";
import { ChevronRightIcon } from "@/node_modules/@heroicons/react/20/solid";
import Link from "@/node_modules/next/link";

export default async function Chatbots() {
  const { userId } = await owner();

  const chatbots = await prisma.chatBot.findMany({
    include: {
      _count: {
        select: {
          ChatBotUserSession: true,
        },
      },
    },
    where: {
      ownerId: userId,
    },
  });

  return (
    <>
      <PageTitle
        title="Chatbots"
        actionLabel="New"
        actionLink="/console/chatbots/new"
      />

      <div className="-mt-6 max-w-7xl mx-auto">
        {chatbots?.length ? (
          <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:px-0">
            {chatbots.map((chatbot) => (
              <div
                key={chatbot.id}
                className={cn(
                  "relative flex justify-between space-x-3 rounded-lg border border-gray-200 px-3 py-2 shadow-sm hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-700 bg-white dark:bg-gray-950",
                )}
              >
                <Link
                  href={`/console/chatbots/${chatbot.id}`}
                  className="min-w-0 space-y-3"
                  prefetch={false}
                >
                  <div className="flex items-center space-x-3">
                    <h2 className="text-lg font-semibold">
                      <span className="absolute inset-0" aria-hidden="true" />
                      <span className="text-primary text-hero">
                        {chatbot.name}
                      </span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{chatbot.model}</Badge>
                        <span className="block" aria-hidden="true">
                          &middot;
                        </span>
                        <span className="block text-sm">
                          {chatbot._count?.ChatBotUserSession ?? 0} user
                          {chatbot._count?.ChatBotUserSession === 1 ? "" : "s"}
                        </span>
                      </div>
                    </h2>
                  </div>
                </Link>

                <div className="sm:hidden">
                  <ChevronRightIcon
                    className="h-4 w-4 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {!chatbots?.length ? (
        <PageSection className="p-4">
          <EmptyState
            show
            label="chatbot"
            createLink={"/console/chatbots/new"}
          />
        </PageSection>
      ) : null}
    </>
  );
}
