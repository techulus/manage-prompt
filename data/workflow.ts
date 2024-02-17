export const AIModels = [
  "gpt-3.5-turbo",
  "gpt-4-1106-preview",
  "gpt-4-0125-preview",
  "gpt-4",
  "text-davinci-003",
  "text-davinci-edit-001",
  "code-davinci-edit-001",
  "llama-2-70b-chat",
];

export const modelHasInstruction: Record<string, boolean> = {
  "text-davinci-edit-001": true,
  "code-davinci-edit-001": true,
  "llama-2-70b-chat": true,
};

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
  "date" = "date",
  // "select" = "select",
  // "checkbox" = "checkbox",
  // "radio" = "radio",
}
