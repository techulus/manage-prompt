import OpenAI from "openai";
import { capture } from "../src/index.js";

const openai = new OpenAI();

const response = await capture(
  { model: "gpt-4o-mini", messages: [{ role: "user" as const, content: "Say hello in one sentence." }] },
  (input) => openai.chat.completions.create(input),
);

console.log("Response:", response.choices[0]?.message?.content);
console.log("Usage:", response.usage);
