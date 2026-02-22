import Anthropic from "@anthropic-ai/sdk";
import { capture } from "../src/index.js";

const anthropic = new Anthropic();

const response = await capture(
  { model: "claude-sonnet-4-20250514", messages: [{ role: "user", content: "Say hello in one sentence." }] },
  (input) => anthropic.messages.create({ ...input, max_tokens: 1024 }),
);

console.log("Response:", response.content);
console.log("Usage:", response.usage);
