import ChatDeploy from "@/components/console/chatbot/chat-deploy";
import ChatView from "@/components/console/chatbot/chat-view";
import PageSection from "@/components/core/page-section";
import { DeleteButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { getAppBaseUrl } from "@/lib/utils/url";
import { Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteChatBot } from "../actions";

type Props = {
  params: {
    id: string;
  };
};

export const revalidate = 0;
export const dynamic = "force-dynamic";

async function ChatDashboard({ params }: Props) {
  const { userId, ownerId } = await owner();
  const { id } = params;

  const chatBot = await prisma.chatBot.findUnique({
    where: {
      id,
    },
  });

  if (!chatBot) {
    return notFound();
  }

  const { token } = await fetch(`${getAppBaseUrl()}/api/v1/chat/token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MANAGEPROMPT_SECRET_TOKEN!}`,
    },
    body: JSON.stringify({
      chatbotId: id,
      sessionId: userId,
    }),
  }).then((res) => res.json());

  const apiSecretKey = await prisma.secretKey.findFirst({
    where: {
      ownerId,
    },
  });

  return (
    <>
      <PageTitle title={chatBot.name} backUrl="/console/chatbots">
        <div className="text-sm">
          ID:{" "}
          <span className="p-1 border border-secondary rounded-lg font-mono text-primary bg-secondary">
            {chatBot.id}
          </span>
        </div>
      </PageTitle>

      <PageSection topInset bottomMargin>
        <div className="flex h-12 flex-col justify-center">
          <div className="px-4 sm:px-6 lg:-mx-4">
            <div className="flex justify-between py-3">
              <div className="isolate inline-flex sm:space-x-3">
                <span className="inline-flex space-x-1">
                  <Link
                    href={`/console/chatbots/${id}/edit`}
                    className={buttonVariants({ variant: "ghost" })}
                  >
                    <Pencil className="w-4 h-4" />
                    <span className="ml-2">Edit</span>
                  </Link>
                </span>
              </div>

              <span className="isolate inline-flex">
                <form action={deleteChatBot}>
                  <input
                    className="hidden"
                    type="text"
                    name="id"
                    defaultValue={id}
                  />
                  <DeleteButton />
                </form>
              </span>
            </div>
          </div>
        </div>
      </PageSection>

      <Tabs defaultValue={"review"} className="max-w-7xl mx-auto">
        <TabsList className="max-w-5xl mx-4 lg:mx-auto mb-2">
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
        </TabsList>
        <TabsContent value="review">
          <PageSection>
            <ChatView token={token} />
          </PageSection>
        </TabsContent>
        <TabsContent value="deploy">
          <PageSection>
            <ChatDeploy id={id} apiSecretKey={apiSecretKey?.key ?? ""} />
          </PageSection>
        </TabsContent>
      </Tabs>
    </>
  );
}

export default ChatDashboard;
