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
    const ivBuffer = crypto.randomBytes(16);
    const iv = new Uint8Array(ivBuffer);
    const key = new Uint8Array(Buffer.from(this.#key));
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const encrypted = Buffer.concat([
      new Uint8Array(cipher.update(text)),
      new Uint8Array(cipher.final()),
    ]);
    return { iv: ivBuffer.toString("hex"), data: encrypted.toString("hex") };
  }

  decrypt(payload: { iv: string; data: string }): string {
    const iv = new Uint8Array(Buffer.from(payload.iv, "hex"));
    const encryptedText = new Uint8Array(Buffer.from(payload.data, "hex"));
    const key = new Uint8Array(Buffer.from(this.#key));
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    const decrypted = Buffer.concat([
      new Uint8Array(decipher.update(encryptedText)),
      new Uint8Array(decipher.final()),
    ]);
    return decrypted.toString();
  }
}
