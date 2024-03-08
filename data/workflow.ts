export const AIModelToLabel = {
  "gpt-3.5-turbo": "GPT-3.5 Turbo",
  "gpt-3.5-turbo-0125": "GPT-3.5 Turbo 0125",
  "gpt-4-1106-preview": "GPT-4 1106 Preview",
  "gpt-4-0125-preview": "GPT-4 0125 Preview",
  "gpt-4": "GPT-4",
  "meta-llama/Llama-2-70b-chat-hf": "Meta Llama 2 70b",
  "mistralai/Mixtral-8x7B-Instruct-v0.1": "Mixtral 8x7B",
  "google/gemma-7b-it": "Google Gemma 7B",
} as const;

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
  "text" = "text",
  "textarea" = "textarea",
  "number" = "number",
  // "select" = "select",
  // "checkbox" = "checkbox",
  // "radio" = "radio",
}
