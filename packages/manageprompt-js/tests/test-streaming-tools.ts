import { streamText, wrapLanguageModel, tool } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { manageprompt } from "../src/index.js";

const openrouter = createOpenRouter();

const model = wrapLanguageModel({
  model: openrouter("anthropic/claude-sonnet-4"),
  middleware: manageprompt(),
});

const result = streamText({
  model,
  prompt:
    "What's the weather in London and Tokyo? After getting the weather, write a detailed 3 paragraph comparison of the two cities' climates.",
  tools: {
    getWeather: tool({
      description: "Get the current weather for a city",
      parameters: z.object({
        city: z.string().describe("The city name"),
      }),
      execute: async ({ city }) => {
        await new Promise((r) => setTimeout(r, 500));
        const data: Record<string, { temp: number; condition: string }> = {
          London: { temp: 12, condition: "Cloudy with light rain" },
          Tokyo: { temp: 22, condition: "Sunny with scattered clouds" },
        };
        return data[city] ?? { temp: 15, condition: "Unknown" };
      },
    }),
  },
  maxSteps: 3,
});

for await (const part of result.textStream) {
  process.stdout.write(part);
}

console.log("\n\nUsage:", await result.usage);
console.log("Steps:", (await result.steps).length);
