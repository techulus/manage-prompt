export type AIProvider = "openrouter";

export const AIModelToLabel = {
  // OpenAI Models
  "gpt-4": "GPT-4 (Deprecated)",
  "gpt-4o": "GPT 4o",
  "gpt-4o-mini": "GPT 4o mini",
  "gpt-4.1": "GPT 4.1",
  "gpt-4.1-mini": "GPT 4.1 mini",
  "gpt-4.1-nano": "GPT 4.1 nano",
  "gpt-4.5": "GPT 4.5",
  "gpt-5": "GPT 5",
  "o1-mini": "o1 Mini",
  "o3-mini": "o3 Mini",
  "o3-pro": "o3 Pro",
  "o4-mini": "o4 Mini",
  "gpt-oss-120b": "GPT OSS 120B",
  "gpt-oss-20b": "GPT OSS 20B",
  "gpt-5.1": "GPT 5.1",
  "gpt-5.2": "GPT 5.2",
  "gpt-5-mini": "GPT 5 Mini",
  "gpt-5-nano": "GPT 5 Nano",
  "gpt-5-pro": "GPT 5 Pro",

  // Anthropic Models
  "claude-3-5-sonnet-20240620": "Claude 3.5 Sonnet",
  "claude-3-5-haiku": "Claude 3.5 Haiku",
  "claude-3-7-sonnet": "Claude 3.7 Sonnet",
  "claude-4-sonnet": "Claude 4 Sonnet",
  "claude-haiku-4.5": "Claude 4.5 Haiku",
  "claude-sonnet-4.5": "Claude 4.5 Sonnet",
  // xAI/Grok Models
  "grok-2-latest": "Grok 2",
  "grok-2-1212": "Grok 2 (Dec 2024)",
  "grok-3": "Grok 3",
  "grok-3-mini": "Grok 3 Mini",
  "grok-4": "Grok 4",
  "grok-4-heavy": "Grok 4 Heavy",
  "grok-beta": "Grok Beta",
  "grok-4-fast": "Grok 4 Fast",
  "grok-4.1-fast": "Grok 4.1 Fast",

  // Google Models
  // Gemini 3 Series
  "gemini-3-pro-preview": "Gemini 3 Pro Preview",
  "gemini-3-flash-preview": "Gemini 3 Flash Preview",

  // Gemini 2.5 Series
  "gemini-2-5-pro": "Gemini 2.5 Pro",
  "gemini-2-5-flash": "Gemini 2.5 Flash",
  "gemini-2-5-flash-lite": "Gemini 2.5 Flash Lite",

  // Gemini 2.0 Series
  "gemini-2-0-pro-experimental": "Gemini 2.0 Pro Experimental",
  "gemini-2-0-flash": "Gemini 2.0 Flash",
  "gemini-2-0-flash-lite": "Gemini 2.0 Flash Lite",

  // Gemini 1.5 Series
  "gemini-1-5-pro": "Gemini 1.5 Pro",
  "gemini-1-5-flash": "Gemini 1.5 Flash",

  // Gemma Open Models
  "gemma-3": "Gemma 3",
  "gemma-2-9b": "Gemma 2 9B",
  "gemma-2-27b": "Gemma 2 27B",
  "code-gemma": "Code Gemma",
  "med-gemma": "Med Gemma",
  "tx-gemma": "TX Gemma",
  "google/gemma-7b-it": "Google Gemma 7B IT",

  // DeepSeek Models
  "deepseek-chat-v3.1": "DeepSeek V3.1",
  "deepseek-v3.2": "DeepSeek V3.2",
  "deepseek-r1": "DeepSeek R1",
  "deepseek-r1-0528": "DeepSeek R1 0528",

  // Meta Llama Models
  "llama-4-scout": "Llama 4 Scout",
  "llama-3.3-70b": "Llama 3.3 70B",
  "meta-llama/Llama-2-70b-chat-hf": "Meta Llama 2 70b",

  // Mistral Models
  "mistral-medium-3": "Mistral Medium 3",
  "mistral-medium-3.1": "Mistral Medium 3.1",
  "codestral-2508": "Codestral 2508",
  "devstral-small": "Devstral Small",
  "devstral-medium": "Devstral Medium",
  "mistralai/Mixtral-8x7B-Instruct-v0.1": "Mixtral 8x7B",

  // Qwen Models
  "qwen3-coder": "Qwen3 Coder",
  "qwen3-max": "Qwen3 Max",
  "qwq-32b": "QwQ 32B",

  // Kimi Models
  "kimi-k2": "Kimi K2",
  "kimi-k2.5": "Kimi K2.5",

  // MiniMax Models
  "minimax-m1": "MiniMax M1",
} as const;

export const modelToProviderId: Record<string | AIModel, string> = {
  // OpenAI Models
  "gpt-4": "openai/gpt-4",
  "gpt-4o": "openai/gpt-4o",
  "gpt-4o-mini": "openai/gpt-4o-mini",
  "gpt-4.1": "openai/gpt-4-turbo",
  "gpt-4.1-mini": "openai/gpt-4o-mini",
  "gpt-4.1-nano": "openai/gpt-4o-mini",
  "gpt-4.5": "openai/gpt-4.5-turbo",
  "gpt-5": "openai/gpt-5",
  "o1-mini": "openai/o1-mini",
  "o3-mini": "openai/o3-mini",
  "o3-pro": "openai/o3-pro",
  "o4-mini": "openai/o4-mini",
  "gpt-oss-120b": "openai/gpt-oss-120b",
  "gpt-oss-20b": "openai/gpt-oss-20b",
  "gpt-5.1": "openai/gpt-5.1",
  "gpt-5.2": "openai/gpt-5.2",
  "gpt-5-mini": "openai/gpt-5-mini",
  "gpt-5-nano": "openai/gpt-5-nano",
  "gpt-5-pro": "openai/gpt-5-pro",

  // Anthropic Models
  "claude-3-5-sonnet-20240620": "anthropic/claude-3.5-sonnet",
  "claude-3-5-haiku": "anthropic/claude-3.5-haiku",
  "claude-3-7-sonnet": "anthropic/claude-3.7-sonnet",
  "claude-4-sonnet": "anthropic/claude-sonnet-4",
  "claude-haiku-4.5": "anthropic/claude-haiku-4.5",
  "claude-sonnet-4.5": "anthropic/claude-sonnet-4.5",
  // xAI/Grok Models
  "grok-2-latest": "x-ai/grok-2",
  "grok-2-1212": "x-ai/grok-2-1212",
  "grok-3": "x-ai/grok-3",
  "grok-3-mini": "x-ai/grok-3-mini",
  "grok-4": "x-ai/grok-4",
  "grok-4-heavy": "x-ai/grok-4-heavy",
  "grok-beta": "x-ai/grok-beta",
  "grok-4-fast": "x-ai/grok-4-fast",
  "grok-4.1-fast": "x-ai/grok-4.1-fast",

  // DeepSeek Models
  "deepseek-chat-v3.1": "deepseek/deepseek-chat-v3.1",
  "deepseek-v3.2": "deepseek/deepseek-v3.2",
  "deepseek-r1": "deepseek/deepseek-r1:free",
  "deepseek-r1-0528": "deepseek/deepseek-r1-0528:free",

  // Meta Llama Models
  "llama-4-scout": "meta-llama/llama-4-scout:free",
  "llama-3.3-70b": "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/Llama-2-70b-chat-hf": "meta-llama/llama-2-70b-chat",

  // Mistral Models
  "mistral-medium-3": "mistralai/mistral-medium-3",
  "mistral-medium-3.1": "mistralai/mistral-medium-3.1",
  "codestral-2508": "mistralai/codestral-2508",
  "devstral-small": "mistralai/devstral-small-2505",
  "devstral-medium": "mistralai/devstral-medium-2507",
  "mistralai/Mixtral-8x7B-Instruct-v0.1": "mistralai/mixtral-8x7b-instruct",

  // Qwen Models
  "qwen3-coder": "qwen/qwen3-coder",
  "qwen3-max": "qwen/qwen3-max",
  "qwq-32b": "qwen/qwq-32b:free",

  // Kimi Models
  "kimi-k2": "moonshotai/kimi-k2",
  "kimi-k2.5": "moonshotai/kimi-k2.5",

  // MiniMax Models
  "minimax-m1": "minimax/minimax-m1",

  // Google Models
  // Gemini 3 Series
  "gemini-3-pro-preview": "google/gemini-3-pro-preview",
  "gemini-3-flash-preview": "google/gemini-3-flash-preview",

  // Gemini 2.5 Series
  "gemini-2-5-pro": "google/gemini-2.5-pro",
  "gemini-2-5-flash": "google/gemini-2.5-flash",
  "gemini-2-5-flash-lite": "google/gemini-2.5-flash-lite",

  // Gemini 2.0 Series
  "gemini-2-0-pro-experimental": "google/gemini-2.0-pro-experimental",
  "gemini-2-0-flash": "google/gemini-2.0-flash",
  "gemini-2-0-flash-lite": "google/gemini-2.0-flash-lite",

  // Gemini 1.5 Series
  "gemini-1-5-pro": "google/gemini-1.5-pro",
  "gemini-1-5-flash": "google/gemini-1.5-flash",

  // Gemma Open Models
  "gemma-3": "google/gemma-3",
  "gemma-2-9b": "google/gemma-2-9b",
  "gemma-2-27b": "google/gemma-2-27b",
  "code-gemma": "google/code-gemma",
  "med-gemma": "google/med-gemma",
  "tx-gemma": "google/tx-gemma",
  "google/gemma-7b-it": "google/gemma-7b-it",
};

export type AIModel = keyof typeof AIModelToLabel;
export const AIModels = Object.keys(AIModelToLabel) as Array<AIModel>;

export const modelHasInstruction: Record<string, boolean> = {};

export type WorkflowInput = {
  name: string;
  type?: WorkflowInputType;
  label?: string;
  value?: string;
};

export enum WorkflowInputType {
  text = "text",
  textarea = "textarea",
  number = "number",
  url = "url",
}

export const WorkflowInputTypeToLabel: Record<
  WorkflowInputType | string,
  string
> = {
  text: "Text",
  textarea: "Text Area",
  number: "Number",
  url: "Webpage content",
} as const;

export const WorkflowInputTypeToZapierFieldType: Record<
  WorkflowInputType | string,
  string
> = {
  text: "string",
  textarea: "text",
  number: "number",
  url: "string",
} as const;

export const WorkflowTestCondition: Record<string, string> = {
  equals: "equals",
  notEquals: "not equals",
  contains: "contains",
  doesNotContain: "does not contain",
  isGreaterThan: "is greater than",
  isLessThan: "is less than",
  isValidJson: "is valid JSON",
} as const;
