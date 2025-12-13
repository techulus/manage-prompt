import crypto from "node:crypto";

export type EncryptedPayload = {
  iv: string;
  data: string;
};

export class EncryptionService {
  #key: string;

  constructor(key: string) {
    if (!key) {
      throw new Error("Invalid key");
    }

    this.#key = key;
  }

  encrypt(text: string): EncryptedPayload {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(this.#key);
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      key as unknown as Uint8Array,
      iv as unknown as Uint8Array,
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()] as unknown as Uint8Array[]);
    return { iv: iv.toString("hex"), data: encrypted.toString("hex") };
  }

  decrypt(payload: { iv: string; data: string }): string {
    const iv = Buffer.from(payload.iv, "hex");
    const encryptedText = Buffer.from(payload.data, "hex");
    const key = Buffer.from(this.#key);
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      key as unknown as Uint8Array,
      iv as unknown as Uint8Array,
    );
    let decrypted = decipher.update(encryptedText as unknown as Uint8Array);
    decrypted = Buffer.concat([decrypted, decipher.final()] as unknown as Uint8Array[]);
    return decrypted.toString();
  }
}
