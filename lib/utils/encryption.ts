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
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      Buffer.from(this.#key),
      iv,
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString("hex"), data: encrypted.toString("hex") };
  }

  decrypt(payload: { iv: string; data: string }): string {
    const iv = Buffer.from(payload.iv, "hex");
    const encryptedText = Buffer.from(payload.data, "hex");
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      Buffer.from(this.#key),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
