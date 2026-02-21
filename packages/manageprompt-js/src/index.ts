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

function extractTokens(usage: LanguageModelV3Usage): {
  input?: number;
  output?: number;
} {
  return {
    input: usage.inputTokens.total,
    output: usage.outputTokens.total,
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
      const tokens = extractTokens(result.usage);

      send(baseURL, {
        model: model.modelId,
        provider: model.provider,
        prompt: params.prompt,
        response_text: extractText(result.content),
        tokens_input: tokens.input,
        tokens_output: tokens.output,
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

      const transform = new TransformStream<
        LanguageModelV3StreamPart,
        LanguageModelV3StreamPart
      >({
        transform(chunk, controller) {
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
          const tokens = usage ? extractTokens(usage) : {};

          send(baseURL, {
            model: model.modelId,
            provider: model.provider,
            prompt: params.prompt,
            response_text: text,
            tokens_input: tokens.input,
            tokens_output: tokens.output,
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
