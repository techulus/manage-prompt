# ManagePrompt

Local LLM call debugger. Captures every LLM API call during development with full request/response details, token usage, cost, and latency.

<img width="3902" height="2576" alt="CleanShot 2026-02-22 at 18 09 03@2x" src="https://github.com/user-attachments/assets/8f24dbb4-1846-4c61-997d-83e23d9355c2" />

## Quick Start

```bash
manageprompt start
```

```
URL: http://localhost:54321
```

## Integration

### Vercel AI SDK (Recommended)

```bash
pnpm add manageprompt
```

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

Works with OpenAI, Anthropic, and any SDK that returns a standard response object.

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

## What Gets Captured

- Full request and response bodies
- Visual request flow with tool call visualization
- Latency
- Token usage (input, output, cache read, cache write)
- Cost estimation (via [models.dev](https://models.dev) pricing)

## CLI

```
manageprompt start            # Start the server (default port 54321)
manageprompt start -p 8080    # Custom port
manageprompt clear            # Clear all stored requests
manageprompt version          # Print version
```

## Install

### Homebrew

```bash
brew install techulus/tap/manageprompt
```

### Go

```bash
go install github.com/techulus/manage-prompt/cmd/manageprompt@latest
```

### Build from Source

```bash
go build -o bin/manageprompt ./cmd/manageprompt
```

## How It Works

ManagePrompt runs a local server with a web UI. Your app sends call data via the `manageprompt` npm package — either automatically through the AI SDK middleware or explicitly via `capture()` / `log()`.

1. Your app makes an LLM call wrapped with ManagePrompt
2. The wrapper captures the full request, response, tokens, cost, and latency
3. Data is sent to the local ManagePrompt server (`POST /api/ingest`)
4. Everything is stored in SQLite (`.manageprompt/requests.db` in the current directory)
5. The web UI updates in real-time via WebSocket

## License

MIT
