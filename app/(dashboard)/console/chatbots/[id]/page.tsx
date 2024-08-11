import PageSection from "@/components/core/page-section";
import PageTitle from "@/components/layout/page-title";
import { buttonVariants } from "@/components/ui/button";
import { deleteChatBot } from "../actions";
import { DeleteButton } from "@/components/form/button";
import ChatView from "@/components/console/chatbot/chat-view";
import { prisma } from "@/lib/utils/db";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: {
    id: string;
  };
};

async function ChatDashboard({ params }: Props) {
  const { id } = params;

  const chatBot = await prisma.chatBot.findUnique({
    where: {
      id,
    },
  });

  if (!chatBot) {
    return notFound();
  }

  return (
    <>
      <PageTitle title={chatBot.name} backUrl="/console/chatbots" />

      <PageSection topInset bottomMargin>
        <div className="flex h-12 flex-col justify-center">
          <div className="px-4 sm:px-6 lg:px-8 lg:-mx-4">
            <div className="flex justify-between py-3">
              <div className="isolate inline-flex sm:space-x-3">
                <span className="inline-flex space-x-1">
                  <Link
                    href={`/console/chatbots/${id}/edit`}
                    className={buttonVariants({ variant: "ghost" })}
                  >
                    Edit
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

      <PageSection>
        <ChatView id={id} />
      </PageSection>
    </>
  );
}

export default ChatDashboard;
