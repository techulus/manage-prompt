import { OpenAIModel, WorkflowInput } from "@/data/workflow";
import slugify from "slugify";
import * as Yup from "yup";

export const WorkflowSchema = Yup.object().shape({
  name: Yup.string()
    .required("Name cannot be empty")
    .min(2, "Name too Short!")
    .max(75, "Name too Long!"),
  template: Yup.string()
    .required("Template cannot be empty")
    .min(2, "Template too Short!")
    .max(9669, "Template too Long!"),
  instruction: Yup.string().optional(),
  model: Yup.mixed<OpenAIModel>()
    .oneOf(Object.values(OpenAIModel))
    .required("Select valid model"),
  inputs: Yup.array().of(
    Yup.object().shape({
      name: Yup.string(),
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
