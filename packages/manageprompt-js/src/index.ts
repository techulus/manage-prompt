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

interface ManagePromptOptions {
  url?: string;
}

function extractText(content: LanguageModelV3GenerateResult["content"]): string {
  return content
    .filter((part): part is Extract<typeof part, { type: "text" }> => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function sum(...values: (number | undefined)[]): number {
  let s = 0;
  for (const v of values) if (v != null) s += v;
  return s;
}

function extractCost(providerMetadata: unknown): number | undefined {
  if (!providerMetadata || typeof providerMetadata !== "object") return undefined;
  const meta = providerMetadata as any;
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
      const start = Date.now();
      const { stream, ...rest } = await doStream();

      let text = "";
      let usage: LanguageModelV3Usage | null = null;
      let finishReason: LanguageModelV3FinishReason | null = null;
      const chunks: LanguageModelV3StreamPart[] = [];

      const transform = new TransformStream<
        LanguageModelV3StreamPart,
        LanguageModelV3StreamPart
      >({
        transform(chunk, controller) {
          chunks.push(chunk);
          if (chunk.type === "text-delta") {
            text += chunk.delta;
          }
          if (chunk.type === "finish") {
            usage = chunk.usage;
            finishReason = chunk.finishReason;
          }
          controller.enqueue(chunk);
        },
        flush() {
          if (!usage) {
            const finish = chunks.find((c) => c.type === "finish");
            if (finish && finish.type === "finish") {
              usage = finish.usage;
              finishReason = finish.finishReason;
            }
          }

          const finishChunk = chunks.find((c) => c.type === "finish");
          const costUSD = finishChunk && "providerMetadata" in finishChunk
            ? extractCost(finishChunk.providerMetadata)
            : undefined;
          send(baseURL, {
            model: model.modelId,
            provider: model.provider,
            prompt: params.prompt,
            response_text: text,
            ...(usage ? extractUsage(usage) : {}),
            ...(costUSD != null ? { cost_usd: costUSD } : {}),
            raw_response: chunks,
            latency_ms: Date.now() - start,
            is_streaming: true,
            finish_reason: finishReason?.unified,
          });
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

interface DetectedFields {
  provider: string;
  model: string;
  response_text: string;
  tokens_input?: number;
  tokens_output?: number;
  cache_read_tokens?: number;
  cache_write_tokens?: number;
  finish_reason?: string;
}

function detectProvider(response: unknown): DetectedFields | null {
  if (!response || typeof response !== "object") return null;

  const r = response as any;

  if (r.object === "chat.completion") {
    return {
      provider: "openai",
      model: r.model ?? "",
      response_text: r.choices?.[0]?.message?.content ?? "",
      tokens_input: r.usage?.prompt_tokens,
      tokens_output: r.usage?.completion_tokens,
      cache_read_tokens: r.usage?.prompt_tokens_details?.cached_tokens,
      finish_reason: r.choices?.[0]?.finish_reason,
    };
  }

  if (r.type === "message") {
    const text = Array.isArray(r.content)
      ? r.content
          .filter((b: any) => b.type === "text")
          .map((b: any) => b.text)
          .join("")
      : "";

    return {
      provider: "anthropic",
      model: r.model ?? "",
      response_text: text,
      tokens_input: r.usage?.input_tokens,
      tokens_output: r.usage?.output_tokens,
      cache_read_tokens: r.usage?.cache_read_input_tokens,
      cache_write_tokens: r.usage?.cache_creation_input_tokens,
      finish_reason: r.stop_reason,
    };
  }

  return null;
}

export interface CaptureInput {
  model: string;
  messages: any[];
  url?: string;
  provider?: string;
}

export async function capture<T>(
  input: CaptureInput,
  fn: (params: { model: string; messages: any[] }) => Promise<T>,
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

export interface LogData {
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
}

export function log(data: LogData): void {
  const { url, ...fields } = data;
  const baseURL = (url ?? DEFAULT_URL).replace(/\/$/, "");
  send(baseURL, fields);
}
