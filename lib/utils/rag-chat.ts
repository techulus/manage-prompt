import { decrypt } from "@/lib/utils/encryption";
import { openai, RAGChat } from "@upstash/rag-chat";
import { Index } from "@upstash/vector";

export const ragChat = new RAGChat({
  model: openai("gpt-4o"),
});

export const index = new Index({
  url: process.env.UPSTASH_VECTOR_REST_URL!,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
});

export type ChatBotTokenData = {
  ownerId: string;
  chatbotId: string;
  sessionId: string;
};

export function decryptChatbotToken(token: string): ChatBotTokenData | null {
  try {
    if (!token) return null;
    const decodedToken = Buffer.from(token, "base64url").toString("utf-8");
    const decryptedToken = decrypt(JSON.parse(decodedToken));
    return JSON.parse(decryptedToken);
  } catch (_) {
    return null;
  }
}
