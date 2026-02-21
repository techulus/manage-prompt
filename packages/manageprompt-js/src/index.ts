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

export function manageprompt(
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
      send(baseURL, {
        model: model.modelId,
        provider: model.provider,
        prompt: params.prompt,
        response_text: extractText(result.content),
        ...extractUsage(result.usage),
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

          send(baseURL, {
            model: model.modelId,
            provider: model.provider,
            prompt: params.prompt,
            response_text: text,
            ...(usage ? extractUsage(usage) : {}),
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
