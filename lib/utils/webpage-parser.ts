import { Readability } from "@mozilla/readability";
import { Capture } from "capture-node";
import { JSDOM } from "jsdom";
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

    const contentUrl = this.#captureClient.buildContentUrl(url, {
      delay: 1,
    });

    try {
      const htmlContent = await fetch(contentUrl)
        .then((res) => res.json())
        .then((res) => (res as { html: string }).html);

      const dom = new JSDOM(htmlContent);
      const readable = new Readability(dom.window.document).parse();
      return readable?.textContent || "";
    } catch (e) {
      return "Failed to fetch content";
    }
  }
}
