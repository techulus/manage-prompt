# ManagePrompt

Local LLM call debugger. Captures every LLM API call during development with full request/response details, token usage, cost, and latency.

```
Your app → ManagePrompt (localhost:54321) → Any LLM API
                    ↓
              Web UI + SQLite
```

## Quick Start

```bash
manageprompt start
```

```
Proxy:  http://localhost:54321
UI:     http://localhost:54321/ui
```

## Integration

### Vercel AI SDK (Recommended)

Install the middleware:

```bash
pnpm add manageprompt
```

Wrap your model:

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

Works with any AI SDK provider — OpenAI, Anthropic, Google, Mistral, etc. No proxy needed, captures structured data including prompt, tokens, cost, and latency.

### Proxy Mode

Point your SDK at the proxy and set the `X-ManagePrompt-Target` header to the real API:

#### OpenAI

```ts
import OpenAI from "openai";

const client = new OpenAI({
  baseURL: "http://localhost:54321/v1",
  defaultHeaders: {
    "X-ManagePrompt-Target": "https://api.openai.com/v1"
  }
});
```

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:54321/v1",
    default_headers={
        "X-ManagePrompt-Target": "https://api.openai.com/v1"
    }
)
```

#### Anthropic

```ts
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  baseURL: "http://localhost:54321",
  defaultHeaders: {
    "X-ManagePrompt-Target": "https://api.anthropic.com"
  }
});
```

```python
from anthropic import Anthropic

client = Anthropic(
    base_url="http://localhost:54321",
    default_headers={
        "X-ManagePrompt-Target": "https://api.anthropic.com"
    }
)
```

Works with any LLM API — just set the target header.

## What Gets Captured

- Full request and response bodies
- Headers (API keys are automatically masked)
- Latency
- Token usage (OpenAI and Anthropic)
- Cost estimate (via [models.dev](https://models.dev) pricing)
- Streaming support (SSE)

## CLI

```
manageprompt start            # Start proxy + UI (default port 54321)
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

ManagePrompt runs a local HTTP proxy. When your app makes an API call, the proxy:

1. Reads the `X-ManagePrompt-Target` header to determine where to forward
2. Forwards the request to the real API (preserving all headers except the target header)
3. Captures the full request and response
4. Extracts metadata (model, tokens, cost) for known providers
5. Stores everything in SQLite (`.manageprompt/requests.db` in the current directory)
6. Returns the response to your app unchanged

Streaming responses (SSE) are forwarded in real-time — no buffering delay.

## License

MIT
