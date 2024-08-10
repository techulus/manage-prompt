import { openai, RAGChat } from "@upstash/rag-chat";

export const ragChat = new RAGChat({
  model: openai("gpt-4o", {
    apiKey: process.env.OPENAI_API_KEY!,
  }),
});
