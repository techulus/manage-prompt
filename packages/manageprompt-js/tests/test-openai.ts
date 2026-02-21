import { generateText, wrapLanguageModel } from "ai";
import { openai } from "@ai-sdk/openai";
import { devToolsMiddleware } from "../src/index.js";

const model = wrapLanguageModel({
  model: openai("gpt-4o-mini"),
  middleware: devToolsMiddleware(),
});

const { text, usage } = await generateText({
  model,
  prompt: "Say hello in one sentence.",
});

console.log("Response:", text);
console.log("Usage:", usage);
