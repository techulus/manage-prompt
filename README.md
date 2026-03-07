# ManagePrompt

Local LLM call debugger. Captures every LLM API call during development with full request/response details, token usage, cost, and latency.

<img width="3392" height="2644" alt="CleanShot 2026-02-22 at 18 11 31@2x" src="https://github.com/user-attachments/assets/637c4719-2549-4403-9275-3b2685fe2e40" />

ManagePrompt has two parts:

- **CLI (Go binary)** — runs the local server and web UI for viewing captured requests
- **npm package** — instruments your app to capture and send LLM call data to the server

## Step 1: Install the CLI

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

## Step 2: Start the Server

```bash
manageprompt start
```

```
URL: http://localhost:54321
```

### CLI Commands

```
manageprompt start            # Start the server (default port 54321)
manageprompt start -p 8080    # Custom port
manageprompt clear            # Clear all stored requests
manageprompt version          # Print version
```

## Step 3: Add the npm Package to Your App

```bash
pnpm add manageprompt
```

### Vercel AI SDK (Recommended)

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

## How It Works

1. Your app makes an LLM call wrapped with the `manageprompt` npm package
2. The wrapper captures the full request, response, tokens, cost, and latency
3. Data is sent to the local ManagePrompt server (`POST /api/ingest`)
4. Everything is stored in SQLite (`.manageprompt/requests.db` in the current directory)
5. The web UI updates in real-time via WebSocket

## License

MIT
