# manageprompt

[Vercel AI SDK](https://ai-sdk.dev) middleware for [ManagePrompt](https://github.com/techulus/manage-prompt) — a local LLM call debugger.

Captures every LLM call with full prompt, response, token usage, cost, and latency.

## Install

```bash
pnpm add manageprompt
```

## Usage

```ts
import { generateText, wrapLanguageModel } from "ai";
import { openai } from "@ai-sdk/openai";
import { devToolsMiddleware } from "manageprompt";

const model = wrapLanguageModel({
  model: openai("gpt-4o"),
  middleware: devToolsMiddleware(),
});

const { text } = await generateText({ model, prompt: "Hello" });
```

Works with any AI SDK provider — OpenAI, Anthropic, Google, Mistral, etc.

## Options

```ts
devToolsMiddleware({
  url: "http://localhost:54321",
});
```

## Prerequisites

Start the ManagePrompt server before running your app:

```bash
manageprompt start
```

See the [ManagePrompt README](https://github.com/techulus/manage-prompt) for installation and full documentation.

## License

MIT
