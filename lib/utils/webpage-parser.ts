import { Capture } from "capture-node";
import { z } from "zod";

const UrlValidationSchema = z.url();

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
      const { markdown } = await this.#captureClient.fetchContent(url, {
        delay: 1,
      });

      return markdown;
    } catch (e) {
      console.error("Error fetching content:", e);
      return "Failed to fetch content";
    }
  }
}
