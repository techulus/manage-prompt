import { openai } from "@ai-sdk/openai";
import { generateText, streamText, wrapLanguageModel } from "ai";
import { devToolsMiddleware } from "manageprompt";

const model = wrapLanguageModel({
  model: openai("gpt-4o-mini"),
  middleware: devToolsMiddleware(),
});

const generated = await generateText({
  model,
  prompt: "Say hello from the non-streaming ManagePrompt example in one sentence.",
});

console.log("Generated response:", generated.text);

const streamed = streamText({
  model,
  prompt: "Say hello from the streaming ManagePrompt example in one sentence.",
});

process.stdout.write("Streaming response: ");
for await (const text of streamed.textStream) {
  process.stdout.write(text);
}
process.stdout.write("\n");

await new Promise((resolve) => setTimeout(resolve, 500));
console.log("Open http://localhost:54321 to inspect both requests.");
