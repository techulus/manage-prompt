import { UserKey } from "@prisma/client";
import crypto from "node:crypto";

if (!process.env.BYOK_ENCRYPTION_KEY) {
  throw new Error("BYOK_ENCRYPTION_KEY is not set");
}

const key = process.env.BYOK_ENCRYPTION_KEY;
const iv = crypto.randomBytes(16);

export function encrypt(text: string): {
  iv: string;
  data: string;
} {
  let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return { iv: iv.toString("hex"), data: encrypted.toString("hex") };
}

export function decrypt(payload: { iv: string; data: string }): string {
  let iv = Buffer.from(payload.iv, "hex");
  let encryptedText = Buffer.from(payload.data, "hex");
  let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export function getUserKeyFor(
  provider: "openai" | "groq" | "anthropic",
  userKeys: UserKey[] = []
): string | null {
  const userOpenApiKey = userKeys.find((key) => key.provider === provider);
  if (userOpenApiKey) {
    const apiKey = decrypt(
      userOpenApiKey.data as unknown as { iv: string; data: string }
    );
    return apiKey;
  }
  return null;
}
