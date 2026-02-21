import { generateText, wrapLanguageModel } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { manageprompt } from "../src/index.js";

const openrouter = createOpenRouter();

const model = wrapLanguageModel({
  model: openrouter("anthropic/claude-sonnet-4"),
  middleware: manageprompt(),
});

const { text, usage } = await generateText({
  model,
  prompt: "Say hello in one sentence.",
});

console.log("Response:", text);
console.log("Usage:", usage);
