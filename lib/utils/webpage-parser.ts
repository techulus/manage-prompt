import { Capture } from "capture-node";
import { z } from "zod";
const cheerio = require("cheerio");

const UrlValidationSchema = z.string().url();

export class WebpageParser {
  #captureClient = new Capture(
    process.env.CAPTURE_KEY!,
    process.env.CAPTURE_SECRET!
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

      const $ = cheerio.load(htmlContent);
      $("script, style").remove();

      return $("body")
        .text()
        .trim()
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .replace(/\n/g, " "); // Replace newlines with spaces
    } catch (e) {
      return "Failed to fetch content";
    }
  }
}
