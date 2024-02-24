export const AIModels = [
  "gpt-3.5-turbo",
  "gpt-4-1106-preview",
  "gpt-4-0125-preview",
  "gpt-4",
  "meta-llama/Llama-2-70b-chat-hf",
  "mistralai/Mixtral-8x7B-Instruct-v0.1",
  "google/gemma-7b-it",
] as const;

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
