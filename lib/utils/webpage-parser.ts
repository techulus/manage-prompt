import { Capture } from "capture-node";
import { parse } from "node-html-parser";
import { z } from "zod";

const UrlValidationSchema = z.string().url();

export class WebpageParser {
  #captureClient = new Capture(
    process.env.CAPTURE_KEY!,
    process.env.CAPTURE_SECRET!,
  );

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

      const root = parse(htmlContent);
      root.querySelectorAll("script").forEach((script) => script.remove());
      root.querySelectorAll("style").forEach((style) => style.remove());
      const textContent = root.textContent;

      return textContent.trim().replace(/\s+/g, " ").replace(/\n/g, " ");
    } catch (e) {
      return "Failed to fetch content";
    }
  }
}
