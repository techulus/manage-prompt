import { generateText, wrapLanguageModel } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { manageprompt } from "../src/index.js";

const model = wrapLanguageModel({
  model: anthropic("claude-sonnet-4-20250514"),
  middleware: manageprompt(),
});

const { text, usage } = await generateText({
  model,
  prompt: "Say hello in one sentence.",
});

console.log("Response:", text);
console.log("Usage:", usage);
