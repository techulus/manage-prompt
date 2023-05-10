export const WorkflowModels: Record<string, string> = {
  chat: "gpt-3.5-turbo",
  insert: "text-davinci-003",
  edit: "text-davinci-edit-001",
};

export type WorkflowInput = {
  name: string;
  value: string;
};
