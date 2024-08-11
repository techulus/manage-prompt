"use server";

import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { index, ragChat } from "@/lib/utils/rag-chat";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "@/node_modules/zod";
import { fromZodError } from "@/node_modules/zod-validation-error";

const ChatbotSchema = z.object({
  name: z.string().min(2).max(150),
  model: z.string(),
  contextItems: z.array(z.string()),
});

export async function createChatBot(payload: FormData) {
  const { ownerId, userId } = await owner();

  const model = payload.get("model") as string;
  const name = payload.get("name") as string;
  let contextItems: string[] = [];

  if (contextItems) {
    try {
      contextItems = JSON.parse(payload.get("context") as string);
    } catch (error) {
      console.error("Failed to parse context items", error);
      contextItems = [];
    }
  }

  const validationResult = ChatbotSchema.safeParse({
    name,
    model,
    contextItems,
  });

  if (!validationResult.success) {
    return {
      error: fromZodError(validationResult.error).toString(),
    };
  }

  const chatbot = await prisma.chatBot.create({
    data: {
      name,
      model,
      ownerId,
      contextItems: contextItems ?? [],
      createdBy: userId,
    },
  });

  if (contextItems) {
    for (const item of contextItems) {
      if (!item?.trim()) continue;
      await ragChat.context.add({
        type: "html",
        source: item,
        options: {
          namespace: `${ownerId}-${chatbot.id}`,
        },
      });
    }
  }

  revalidatePath("/console/chatbots");
  redirect(`/console/chatbots/${chatbot.id}`);
}

export async function updateChatBot(payload: FormData) {
  const { ownerId } = await owner();

  const id = payload.get("id") as string;
  const model = payload.get("model") as string;
  const name = payload.get("name") as string;
  let contextItems: string[] = [];

  if (contextItems) {
    try {
      contextItems = JSON.parse(payload.get("context") as string);
    } catch (error) {
      console.error("Failed to parse context items", error);
      contextItems = [];
    }
  }

  const validationResult = ChatbotSchema.safeParse({
    name,
    model,
    contextItems,
  });

  if (!validationResult.success) {
    return {
      error: fromZodError(validationResult.error).toString(),
    };
  }

  await prisma.chatBot.update({
    where: {
      id,
    },
    data: {
      name,
      model,
      contextItems,
    },
  });

  const namespace = `${ownerId}-${id}`;
  await ragChat.context
    .deleteEntireContext({
      namespace,
    })
    .catch((error) => {
      console.error("Failed to delete context", error);
    });

  for (const item of contextItems) {
    if (!item?.trim()) continue;
    void ragChat.context.add({
      type: "html",
      source: item,
      options: {
        namespace,
      },
    });
  }

  revalidatePath(`/console/chatbots/${id}`);
  redirect(`/console/chatbots/${id}`);
}

export async function deleteChatBot(formData: FormData) {
  const id = formData.get("id") as string;
  const { ownerId } = await owner();

  const namespace = `${ownerId}-${id}`;
  await index.deleteNamespace(namespace).catch((error) => {
    console.error("Failed to delete context", error);
  });
  await ragChat.history.deleteMessages({
    sessionId: namespace,
  });

  await prisma.chatBot.delete({
    where: {
      id,
    },
  });

  revalidatePath("/console/chatbots");
  redirect("/console/chatbots");
}
