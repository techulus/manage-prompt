"use server";

import { owner } from "@/lib/hooks/useOwner";
import { prisma } from "@/lib/utils/db";
import { index, ragChat } from "@/lib/utils/rag-chat";
import { z } from "@/node_modules/zod";
import { fromZodError } from "@/node_modules/zod-validation-error";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const ChatbotSchema = z.object({
  name: z.string().min(2).max(150),
  model: z.string(),
  contextItems: z.array(
    z.object({
      type: z.string(),
      source: z.any(),
    }),
  ),
});

export async function createChatBot(payload: FormData) {
  const { ownerId, userId } = await owner();

  const model = payload.get("model") as string;
  const name = payload.get("name") as string;
  const contextItemsTypes = payload.getAll("contextItemsTypes[]") as string[];
  const contextItemsSources = payload.getAll(
    "contextItemsSources[]",
  ) as string[];

  const contextItems = contextItemsTypes.map((type, index) => ({
    type,
    source: contextItemsSources[index],
  }));

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

  if (contextItems.length) {
    for (const item of contextItems) {
      if (
        item.type !== "html" &&
        (item.source as unknown as File).size > 1024 * 1024 * 5
      ) {
        return {
          error: "File size should be less than 5MB",
        };
      }
    }
  }

  const chatbot = await prisma.chatBot.create({
    data: {
      id: `cb_${createId()}`,
      name,
      model,
      ownerId,
      contextItems: contextItems.filter((item) => item.type !== "pdf"),
      createdBy: userId,
    },
  });

  const namespace = `${ownerId}-${chatbot.id}`;
  if (validationResult.data.contextItems.length > 0) {
    for (const item of validationResult.data.contextItems) {
      if (!item?.source) continue;
      if (item.type === "html") {
        ragChat.context
          .add({
            type: item.type as any,
            source: item.source,
            options: {
              namespace,
            },
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        ragChat.context
          .add({
            type: item.type as any,
            fileSource: item.source as any,
            options: {
              namespace,
            },
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  }

  revalidatePath("/chatbots");
  redirect(`/chatbots/${chatbot.id}`);
}

export async function updateChatBot(payload: FormData) {
  const { ownerId } = await owner();

  const id = payload.get("id") as string;
  const model = payload.get("model") as string;
  const name = payload.get("name") as string;
  const contextItemsTypes = payload.getAll("contextItemsTypes[]") as string[];
  const contextItemsSources = payload.getAll(
    "contextItemsSources[]",
  ) as string[];

  const contextItems = contextItemsTypes.map((type, index) => ({
    type,
    source: contextItemsSources[index],
  }));

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
      contextItems: contextItems.filter((item) => item.type !== "pdf"),
    },
  });

  const namespace = `${ownerId}-${id}`;
  await ragChat.context
    .deleteEntireContext({
      namespace,
    })
    .then(() => {
      console.log("Deleted context successfully", namespace);
    })
    .catch((error) => {
      console.error("Failed to delete context", error);
    });

  if (validationResult.data.contextItems.length > 0) {
    for (const item of validationResult.data.contextItems) {
      if (!item?.source) continue;
      if (item.type === "html") {
        ragChat.context
          .add({
            type: item.type as any,
            source: item.source,
            options: {
              namespace,
            },
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        ragChat.context
          .add({
            type: item.type as any,
            fileSource: item.source as any,
            options: {
              namespace,
            },
          })
          .catch((error) => {
            console.error(error);
          });
      }
    }
  }

  revalidatePath(`/chatbots/${id}`);
  redirect(`/chatbots/${id}`);
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

  revalidatePath("/chatbots");
  redirect("/chatbots");
}
