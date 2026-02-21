import { generateText, wrapLanguageModel } from "ai";
import { openai } from "@ai-sdk/openai";
import { manageprompt } from "../src/index.js";

const model = wrapLanguageModel({
  model: openai("gpt-4o-mini"),
  middleware: manageprompt(),
});

const { text, usage } = await generateText({
  model,
  prompt: "Say hello in one sentence.",
});

console.log("Response:", text);
console.log("Usage:", usage);
