export enum OpenAIModel {
  "gpt-3.5-turbo" = "gpt-3.5-turbo",
  "text-davinci-003" = "text-davinci-003",
  "text-davinci-edit-001" = "text-davinci-edit-001",
  "code-davinci-edit-001" = "code-davinci-edit-001",
}

export const WorkflowModels: Record<string, string> = {
  chat: "gpt-3.5-turbo",
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
