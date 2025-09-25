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

  // Anthropic Models
  "claude-3-5-sonnet-20240620": "Claude 3.5 Sonnet",
  "claude-3-5-haiku": "Claude 3.5 Haiku",
  "claude-3-7-sonnet": "Claude 3.7 Sonnet",
  "claude-4-sonnet": "Claude 4 Sonnet",

  // xAI/Grok Models
  "grok-2-latest": "Grok 2",
  "grok-2-1212": "Grok 2 (Dec 2024)",
  "grok-3": "Grok 3",
  "grok-3-mini": "Grok 3 Mini",
  "grok-4": "Grok 4",
  "grok-4-heavy": "Grok 4 Heavy",
  "grok-beta": "Grok Beta",

  // Google Models
  // Gemini 2.5 Series (Latest)
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

  // Other Models
  "meta-llama/Llama-2-70b-chat-hf": "Meta Llama 2 70b",
  "mistralai/Mixtral-8x7B-Instruct-v0.1": "Mixtral 8x7B",
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
  "gpt-5-pro": "openai/gpt-5-pro",
  "o1-mini": "openai/o1-mini",
  "o3-mini": "openai/o3-mini",
  "o3-pro": "openai/o3-pro",
  "o4-mini": "openai/o4-mini",
  "gpt-oss-120b": "openai/gpt-oss-120b",
  "gpt-oss-20b": "openai/gpt-oss-20b",

  // Anthropic Models
  "claude-3-5-sonnet-20240620": "anthropic/claude-3.5-sonnet",
  "claude-3-5-haiku": "anthropic/claude-3.5-haiku",
  "claude-3-7-sonnet": "anthropic/claude-3.7-sonnet",
  "claude-4-sonnet": "anthropic/claude-4-sonnet",
  "claude-4-opus": "anthropic/claude-4-opus",
  "claude-4-1-opus": "anthropic/claude-4.1-opus",

  // xAI/Grok Models
  "grok-2-latest": "x-ai/grok-2",
  "grok-2-1212": "x-ai/grok-2-1212",
  "grok-3": "x-ai/grok-3",
  "grok-3-mini": "x-ai/grok-3-mini",
  "grok-4": "x-ai/grok-4",
  "grok-4-heavy": "x-ai/grok-4-heavy",
  "grok-beta": "x-ai/grok-beta",

  // Meta Models
  "meta-llama/Llama-2-70b-chat-hf": "meta-llama/llama-2-70b-chat",

  // Mistral Models
  "mistralai/Mixtral-8x7B-Instruct-v0.1": "mistralai/mixtral-8x7b-instruct",

  // Google Models
  // Gemini 2.5 Series (Latest)
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
