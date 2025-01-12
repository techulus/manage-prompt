import { Capture } from "capture-node";
import { z } from "zod";

const UrlValidationSchema = z.string().url();

export class WebpageParser {
  #captureClient: Capture;

  constructor() {
    if (!process.env.CAPTURE_KEY || !process.env.CAPTURE_SECRET) {
      throw new Error("Capture API key and secret are required");
    }

    this.#captureClient = new Capture(
      process.env.CAPTURE_KEY,
      process.env.CAPTURE_SECRET,
    );
  }

  async getContent(url: string) {
    const result = UrlValidationSchema.safeParse(url);
    if (!result.success) {
      return "Invalid URL";
    }

    try {
      const { textContent } = await this.#captureClient.fetchContent(url, {
        delay: 1,
      });

      return textContent;
    } catch (e) {
      return "Failed to fetch content";
    }
  }
}
