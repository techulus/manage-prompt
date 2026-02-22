import type {
  LanguageModelV3Middleware,
  LanguageModelV3StreamPart,
  LanguageModelV3CallOptions,
  LanguageModelV3,
  LanguageModelV3GenerateResult,
  LanguageModelV3StreamResult,
  LanguageModelV3Usage,
  LanguageModelV3FinishReason,
} from "@ai-sdk/provider";

type ManagePromptOptions = {
  url?: string;
};

function extractText(content: LanguageModelV3GenerateResult["content"]): string {
  return content
    .filter((part): part is Extract<typeof part, { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function sum(...values: (number | undefined)[]): number {
  return values.reduce<number>((s, v) => s + (v ?? 0), 0);
}

type OpenRouterMetadata = {
  openrouter?: { usage?: { costDetails?: { upstreamInferenceCost?: number } } };
};

function extractCost(providerMetadata: unknown): number | undefined {
  if (!providerMetadata || typeof providerMetadata !== "object") return undefined;
  const meta = providerMetadata as OpenRouterMetadata;
  return meta?.openrouter?.usage?.costDetails?.upstreamInferenceCost ?? undefined;
}

function extractUsage(usage: LanguageModelV3Usage) {
  const tokensInput =
    usage.inputTokens.total ??
    (sum(usage.inputTokens.noCache, usage.inputTokens.cacheRead, usage.inputTokens.cacheWrite) || undefined);

  const tokensOutput =
    usage.outputTokens.total ??
    (sum(usage.outputTokens.text, usage.outputTokens.reasoning) || undefined);

  return {
    tokens_input: tokensInput,
    tokens_output: tokensOutput,
    cache_read_tokens: usage.inputTokens.cacheRead,
    cache_write_tokens: usage.inputTokens.cacheWrite,
  };
}

export function devToolsMiddleware(
  options?: ManagePromptOptions
): LanguageModelV3Middleware {
  const baseURL = (options?.url ?? "http://localhost:54321").replace(/\/$/, "");

  let pendingTimer: ReturnType<typeof setTimeout> | null = null;
  let allChunks: LanguageModelV3StreamPart[] = [];
  let allText = "";
  let lastUsage: LanguageModelV3Usage | null = null;
  let lastFinishReason: LanguageModelV3FinishReason | null = null;
  let lastCostUSD: number | undefined;
  let streamStart = 0;
  let lastModel = "";
  let lastProvider = "";
  let lastPrompt: unknown = null;

  function flushStream() {
    pendingTimer = null;
    send(baseURL, {
      model: lastModel,
      provider: lastProvider,
      prompt: lastPrompt,
      response_text: allText,
      ...(lastUsage ? extractUsage(lastUsage) : {}),
      ...(lastCostUSD != null ? { cost_usd: lastCostUSD } : {}),
      raw_response: allChunks,
      latency_ms: Date.now() - streamStart,
      is_streaming: true,
      finish_reason: lastFinishReason?.unified,
    });
    allChunks = [];
    allText = "";
    lastUsage = null;
    lastFinishReason = null;
    lastCostUSD = undefined;
    streamStart = 0;
  }

  return {
    specificationVersion: "v3",

    wrapGenerate: async ({
      doGenerate,
      params,
      model,
    }: {
      doGenerate: () => PromiseLike<LanguageModelV3GenerateResult>;
      params: LanguageModelV3CallOptions;
      model: LanguageModelV3;
    }) => {
      const start = Date.now();
      const result = await doGenerate();
      const latency = Date.now() - start;
      const costUSD = extractCost(result.providerMetadata);
      send(baseURL, {
        model: model.modelId,
        provider: model.provider,
        prompt: params.prompt,
        response_text: extractText(result.content),
        ...extractUsage(result.usage),
        ...(costUSD != null ? { cost_usd: costUSD } : {}),
        raw_response: result,
        latency_ms: latency,
        is_streaming: false,
        finish_reason: result.finishReason.unified,
      });

      return result;
    },

    wrapStream: async ({
      doStream,
      params,
      model,
    }: {
      doStream: () => PromiseLike<LanguageModelV3StreamResult>;
      params: LanguageModelV3CallOptions;
      model: LanguageModelV3;
    }) => {
      if (streamStart === 0) streamStart = Date.now();
      lastModel = model.modelId;
      lastProvider = model.provider;
      lastPrompt = params.prompt;

      if (pendingTimer) {
        clearTimeout(pendingTimer);
        pendingTimer = null;
      }

      const { stream, ...rest } = await doStream();

      const transform = new TransformStream<
        LanguageModelV3StreamPart,
        LanguageModelV3StreamPart
      >({
        transform(chunk, controller) {
          allChunks.push(chunk);
          if (chunk.type === "text-delta") {
            allText += chunk.delta;
          }
          if (chunk.type === "finish") {
            lastUsage = chunk.usage;
            lastFinishReason = chunk.finishReason;
            const cost = "providerMetadata" in chunk
              ? extractCost(chunk.providerMetadata)
              : undefined;
            if (cost != null) lastCostUSD = (lastCostUSD ?? 0) + cost;
          }
          controller.enqueue(chunk);
        },
        flush() {
          if (lastFinishReason?.unified === "tool-calls") {
            pendingTimer = setTimeout(flushStream, 30_000);
            if (typeof pendingTimer === "object" && "unref" in pendingTimer) pendingTimer.unref();
          } else {
            flushStream();
          }
        },
      });

      return { stream: stream.pipeThrough(transform), ...rest };
    },
  };
}

function send(baseURL: string, data: Record<string, unknown>) {
  fetch(`${baseURL}/api/ingest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
    .then((res) => {
      if (!res.ok) {
        console.error(`[manageprompt] Failed to send data: ${res.status} ${res.statusText}`);
      }
    })
    .catch((err) => {
      console.error(`[manageprompt] Failed to connect to ${baseURL}:`, err.message);
    });
}

const DEFAULT_URL = "http://localhost:54321";

type DetectedFields = {
  provider: string;
  model: string;
  response_text: string;
  tokens_input?: number;
  tokens_output?: number;
  cache_read_tokens?: number;
  cache_write_tokens?: number;
  finish_reason?: string;
};

type OpenAIResponse = {
  object: string;
  model?: string;
  choices?: { message?: { content?: string }; finish_reason?: string }[];
  usage?: { prompt_tokens?: number; completion_tokens?: number; prompt_tokens_details?: { cached_tokens?: number } };
};

type AnthropicContentBlock = { type: string; text?: string };

type AnthropicResponse = {
  type: string;
  model?: string;
  content?: AnthropicContentBlock[];
  usage?: { input_tokens?: number; output_tokens?: number; cache_read_input_tokens?: number; cache_creation_input_tokens?: number };
  stop_reason?: string;
};

function detectProvider(response: unknown): DetectedFields | null {
  if (!response || typeof response !== "object") return null;

  const r = response as Record<string, unknown>;

  if (r.object === "chat.completion") {
    const oai = response as OpenAIResponse;
    return {
      provider: "openai",
      model: oai.model ?? "",
      response_text: oai.choices?.[0]?.message?.content ?? "",
      tokens_input: oai.usage?.prompt_tokens,
      tokens_output: oai.usage?.completion_tokens,
      cache_read_tokens: oai.usage?.prompt_tokens_details?.cached_tokens,
      finish_reason: oai.choices?.[0]?.finish_reason,
    };
  }

  if (r.type === "message") {
    const ant = response as AnthropicResponse;
    const text = Array.isArray(ant.content)
      ? ant.content
          .filter((b) => b.type === "text")
          .map((b) => b.text ?? "")
          .join("")
      : "";

    return {
      provider: "anthropic",
      model: ant.model ?? "",
      response_text: text,
      tokens_input: ant.usage?.input_tokens,
      tokens_output: ant.usage?.output_tokens,
      cache_read_tokens: ant.usage?.cache_read_input_tokens,
      cache_write_tokens: ant.usage?.cache_creation_input_tokens,
      finish_reason: ant.stop_reason,
    };
  }

  return null;
}

export type CaptureInput<M = unknown> = {
  model: string;
  messages: M[];
  url?: string;
  provider?: string;
};

export async function capture<T, M = unknown>(
  input: CaptureInput<M>,
  fn: (params: { model: string; messages: M[] }) => Promise<T>,
): Promise<T> {
  const baseURL = (input.url ?? DEFAULT_URL).replace(/\/$/, "");
  const start = Date.now();
  const result = await fn({ model: input.model, messages: input.messages });
  const latency = Date.now() - start;

  const detected = detectProvider(result);

  send(baseURL, {
    provider: input.provider ?? detected?.provider ?? "unknown",
    model: detected?.model ?? input.model,
    prompt: input.messages,
    response_text: detected?.response_text,
    tokens_input: detected?.tokens_input,
    tokens_output: detected?.tokens_output,
    cache_read_tokens: detected?.cache_read_tokens,
    cache_write_tokens: detected?.cache_write_tokens,
    finish_reason: detected?.finish_reason,
    raw_response: result,
    latency_ms: latency,
    is_streaming: false,
  });

  return result;
}

export type LogData = {
  url?: string;
  model: string;
  provider: string;
  prompt?: unknown;
  response_text?: string;
  raw_response?: unknown;
  tokens_input?: number;
  tokens_output?: number;
  cache_read_tokens?: number;
  cache_write_tokens?: number;
  latency_ms?: number;
  is_streaming?: boolean;
  finish_reason?: string;
};

export function log(data: LogData): void {
  const { url, ...fields } = data;
  const baseURL = (url ?? DEFAULT_URL).replace(/\/$/, "");
  send(baseURL, fields);
}
