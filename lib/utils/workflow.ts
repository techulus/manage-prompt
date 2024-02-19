import { WorkflowInput } from "@/data/workflow";
import slugify from "slugify";
import { z } from "zod";
import { AIModels } from "./../../data/workflow";

export const MAX_GLOBAL_RATE_LIMIT_RPS = 100;
export const MAX_RATE_LIMIT_RPS = 50;

export const WorkflowSchema = z.object({
  name: z.string().min(2).max(150),
  template: z.string().min(1).max(9999),
  instruction: z.string().optional().default(""),
  model: z.enum([...AIModels]),
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
