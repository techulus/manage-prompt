export type AIProvider = "openai" | "groq" | "anthropic" | "xai";

export const AIModelToLabel = {
  "gpt-4": "GPT-4 (Deprecated)",
  "gpt-4o": "GPT 4o",
  "gpt-4o-mini": "GPT 4o mini",
  "gpt-4.1": "GPT 4.1",
  "gpt-4.1-mini": "GPT 4.1 mini",
  "gpt-4.1-nano": "GPT 4.1 nano",
  "o1-mini": "o1 Mini",
  "o3-mini": "o3 Mini",
  "o4-mini": "o4 Mini",
  "meta-llama/Llama-2-70b-chat-hf": "Meta Llama 2 70b",
  "mistralai/Mixtral-8x7B-Instruct-v0.1": "Mixtral 8x7B",
  "google/gemma-7b-it": "Google Gemma 7B",
  "claude-3-5-sonnet-20240620": "Claude 3.5 Sonnet",
  "grok-2-latest": "Grok 2",
  "grok-beta": "Grok Beta",
} as const;

export const modelToProviderId: Record<string | AIModel, string> = {
  "google/gemma-7b-it": "gemma-7b-it",
  "meta-llama/Llama-2-70b-chat-hf": "llama3-8b-8192",
  "mistralai/Mixtral-8x7B-Instruct-v0.1": "mixtral-8x7b-32768",
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
