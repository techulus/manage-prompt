export enum OpenAIModel {
  "gpt-3.5-turbo" = "gpt-3.5-turbo",
  "gpt-4-1106-preview" = "gpt-4-1106-preview",
  "text-davinci-003" = "text-davinci-003",
  "text-davinci-edit-001" = "text-davinci-edit-001",
  "code-davinci-edit-001" = "code-davinci-edit-001",
}

export const WorkflowModels: Record<string, string> = {
  chat: "gpt-3.5-turbo",
  gpt4: "gpt-4-1106-preview",
  insert: "text-davinci-003",
  edit: "text-davinci-edit-001",
  code: "code-davinci-edit-001",
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
