import ChatForm from "@/components/chat/chat-form";
import PageTitle from "@/components/layout/page-title";
import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";

export default async function Chat() {
  const { userId } = owner();

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      settings: true,
    },
  });

  return (
    <>
      <PageTitle title="Chat" />
      <ChatForm
        // @ts-ignore
        defaultModel={user?.settings?.chat_model}
        updateModel={async (value) => {
          "use server";
          await prisma.user.update({
            where: {
              id: userId,
            },
            data: {
              settings: {
                chat_model: value,
              },
            },
          });
        }}
      />
    </>
  );
}
