import { openai, RAGChat } from "@upstash/rag-chat";
import { Index } from "@upstash/vector";

export const ragChat = new RAGChat({
  model: openai("gpt-4o"),
});

export const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export type ChatBotTokenMetadata = {
  ownerId: string;
  chatbotId: string;
  sessionId: string;
};
