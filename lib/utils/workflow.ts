import {
  type AIModel,
  AIModels,
  type WorkflowInput,
  WorkflowInputType,
} from "@/data/workflow";
import { z } from "zod";
import { WebpageParser } from "./webpage-parser";

export const MAX_GLOBAL_RATE_LIMIT_RPS = 100;
export const MAX_RATE_LIMIT_RPS = 50;

const zodEnum = <T>(arr: T[]): [T, ...T[]] => arr as [T, ...T[]];

export const WorkflowSchema = z.object({
  model: z.enum(zodEnum<AIModel>(AIModels)),
  name: z.string().min(2).max(150),
  template: z.string().min(1).max(9999),
  instruction: z.string().optional().default(""),
  modelSettings: z.string().optional().nullable(),
  cacheControlTtl: z.number().int().optional().default(0),
  inputs: z.array(
    z.object({
      name: z.string(),
      label: z.string().optional(),
      type: z.enum(["text", "textarea", "number", "url"]).optional(),
    }),
  ),
});

export const WorkflowBranchSchema = z.object({
  model: z.enum(zodEnum<AIModel>(AIModels)),
  template: z.string().min(1).max(9999),
  instruction: z.string().optional().default(""),
  modelSettings: z.string().optional().nullable(),
});

export const translateInputs = async ({
  inputs,
  inputValues,
  template,
}: {
  inputs: WorkflowInput[];
  inputValues: Record<string, string>;
  template: string;
}) => {
  let content = template;
  const webpageParser = new WebpageParser();
  for (const input of inputs) {
    if (input.type === WorkflowInputType.url) {
      const pageContent = await webpageParser.getContent(
        inputValues[input.name],
      );
      content = content.replace(`{{${input.name}}}`, pageContent);
    } else {
      content = content.replace(`{{${input.name}}}`, inputValues[input.name]);
    }
  }
  return content;
};
