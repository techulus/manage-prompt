import type { AIProvider } from "@/data/workflow";
import type { UserKey } from "@prisma/client";
import { type EncryptedPayload, EncryptionService } from "./encryption";

export class ByokService {
  #byokEncryptionKey = process.env.BYOK_ENCRYPTION_KEY!;
  #encryptionService: EncryptionService;

  constructor() {
    this.#encryptionService = new EncryptionService(this.#byokEncryptionKey);
  }

  create(apiKey: string): EncryptedPayload {
    return this.#encryptionService.encrypt(apiKey);
  }

  get(provider: AIProvider, userKeys: UserKey[] = []): string | null {
    const userOpenApiKey = userKeys.find((key) => key.provider === provider);
    if (userOpenApiKey) {
      const apiKey = this.#encryptionService.decrypt(
        userOpenApiKey.data as unknown as { iv: string; data: string },
      );
      return apiKey;
    }
    return null;
  }
}
