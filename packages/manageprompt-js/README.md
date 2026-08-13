# manageprompt

JavaScript SDK for [ManagePrompt](https://github.com/techulus/manage-prompt) — a local LLM call debugger.

Captures every LLM call with full prompt, response, token usage, cost, and latency.

## Prerequisites

This package sends captured data to the ManagePrompt server. Install and start the server first:

```bash
brew install techulus/tap/manageprompt
manageprompt start
```

See the [ManagePrompt README](https://github.com/techulus/manage-prompt) for other installation methods.

## Install

```bash
pnpm add manageprompt
```

## Usage

### Vercel AI SDK Middleware (Recommended)

This integration supports Vercel AI SDK 7 and requires Node.js 22 or later.

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

#### Test the integration locally

Start ManagePrompt from the repository root:

```bash
go run ./cmd/manageprompt start
```

In another terminal, build the package and run the example with an OpenAI API key:

```bash
cd packages/manageprompt-js
pnpm build
OPENAI_API_KEY=your-key pnpm example:vercel-ai
```

The example makes one generated and one streamed request. Open
`http://localhost:54321` and verify both calls show the prompt, response, token
usage, latency, finish reason, and correct streaming status.

### capture()

Wraps any SDK call. Auto-detects provider, extracts tokens, cost, and latency.

```ts
import OpenAI from "openai";
import { capture } from "manageprompt";

const openai = new OpenAI();

const response = await capture(
  { model: "gpt-4o-mini", messages: [{ role: "user" as const, content: "Hello" }] },
  (input) => openai.chat.completions.create(input),
);
```

Works with OpenAI and Anthropic response formats.

### log()

Manual logging for full control over what gets sent.

```ts
import { log } from "manageprompt";

log({
  model: "gpt-4o",
  provider: "openai",
  prompt: messages,
  response_text: "Hello!",
  tokens_input: 10,
  tokens_output: 5,
  latency_ms: 230,
});
```

## Options

```ts
devToolsMiddleware({ url: "http://localhost:54321" });

capture({ model: "gpt-4o", messages, url: "http://localhost:54321" }, fn);

log({ model: "gpt-4o", provider: "openai", url: "http://localhost:54321" });
```

All functions default to `http://localhost:54321`.

## License

MIT
