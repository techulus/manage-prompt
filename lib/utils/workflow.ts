import { AIModel, AIModels, WorkflowInput } from "@/data/workflow";
import slugify from "slugify";
import { z } from "zod";

export const MAX_GLOBAL_RATE_LIMIT_RPS = 100;
export const MAX_RATE_LIMIT_RPS = 50;

const zodEnum = <T>(arr: T[]): [T, ...T[]] => arr as [T, ...T[]];

export const WorkflowSchema = z.object({
  name: z.string().min(2).max(150),
  template: z.string().min(1).max(9999),
  instruction: z.string().optional().default(""),
  model: z.enum(zodEnum<AIModel>(AIModels)),
  modelSettings: z.string().optional().nullable(),
  inputs: z.array(
    z.object({
      name: z.string(),
      label: z.string().optional(),
      type: z.enum(["text", "textarea", "number"]).optional(),
    })
  ),
});

export const parseInputs = (inputs: string): WorkflowInput[] =>
  Array.from(inputs.matchAll(/{{\s*(?<name>\w+)\s*}}/g))
    .reduce((acc: string[], match) => {
      const { name } = match.groups as { name: string };
      if (!acc.includes(name)) {
        acc.push(name);
      }
      return acc;
    }, [])
    .map((input) => ({ name: slugify(input, { lower: true }) }));
