"use client";

import {
  AIModelToLabel,
  AIModels,
  type WorkflowInput,
  WorkflowInputType,
  WorkflowInputTypeToLabel,
  modelHasInstruction,
} from "@/data/workflow";
import type { Workflow } from "@/generated/prisma-client/client";
import Link from "next/link";
import { useCallback, useState } from "react";
import slugify from "slugify";
import { toast } from "sonner";
import { SaveButton } from "../../form/button";
import { Button, buttonVariants } from "../../ui/button";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import {
  type ModelSettings,
  WorkflowModelSettings,
} from "./workflow-model-settings";

interface Props {
  workflow?: Workflow;
  branchMode?: boolean;
  branchId?: number;
  branchShortId?: string;
  action: (data: FormData) => Promise<any>;
}

const parseInputs = (
  inputs: string,
  currentInputs: WorkflowInput[] | null
): WorkflowInput[] =>
  Array.from(inputs.matchAll(/{{\s*(?<name>\w+)\s*}}/g))
    .reduce((acc: string[], match) => {
      const { name } = match.groups as { name: string };
      if (!acc.includes(name)) {
        acc.push(name);
      }
      return acc;
    }, [])
    .map((input) => ({ name: slugify(input, { lower: false }) }))
    .map((input) => {
      const existingInput = currentInputs?.find((i) => i.name === input.name);
      return existingInput ?? input;
    });

export function WorkflowForm({
  workflow,
  action,
  branchMode = false,
  branchId,
  branchShortId,
}: Props) {
  const [model, setModel] = useState(workflow?.model ?? AIModels[0]);
  const [template, setTemplate] = useState(workflow?.template ?? "");
  const [instruction, setInstruction] = useState(workflow?.instruction ?? "");
  const [inputs, setInputs] = useState<WorkflowInput[]>(
    (workflow?.inputs as WorkflowInput[]) ?? []
  );

  const [showAdvancedModelParams, setShowAdvancedModelParams] = useState(false);
  const [modelSettings, setModelSettings] = useState({});

  const updateInputs = useCallback(
    (value: any) => {
      const updatedValue = { template, instruction, model, ...value };

      if (modelHasInstruction[model]) {
        setInputs(
          parseInputs(
            `${updatedValue.template} ${updatedValue.instruction}`,
            workflow?.inputs as WorkflowInput[] | null
          )
        );
      } else {
        setInputs(
          parseInputs(
            updatedValue.template,
            workflow?.inputs as WorkflowInput[] | null
          )
        );
      }
    },
    [template, instruction, model, workflow?.inputs]
  );

  return (
    <form
      className="space-y-12 sm:space-y-16"
      action={async (data: FormData) => {
        const result = await action(data);
        if (result?.error) {
          toast.error(result.error);
        } else {
          toast.success("Workflow saved successfully");
        }
      }}
    >
      <div>
        {workflow?.id ? (
          <input
            type="number"
            name="id"
            className="hidden"
            defaultValue={Number(workflow?.id)}
          />
        ) : null}
        {branchId ? (
          <input
            type="number"
            name="branchId"
            className="hidden"
            defaultValue={branchId}
          />
        ) : null}

        <div className="space-y-8 border-b pb-12 sm:space-y-0 sm:divide-y sm:border-t sm:pb-0">
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label
              htmlFor="model"
              className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
            >
              Model
            </label>
            <div className="mt-2 sm:col-span-2 sm:mt-0">
              <Select
                name="model"
                value={model}
                onValueChange={(val) => {
                  setModel(val);
                  updateInputs({ model: val });
                }}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  {AIModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {AIModelToLabel[model] ?? model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                className="px-0"
                variant="link"
                onClick={() => setShowAdvancedModelParams((prev) => !prev)}
                type="button"
              >
                {showAdvancedModelParams ? "Hide" : "Show"} Advanced Model
                Params
              </Button>

              {showAdvancedModelParams ? (
                <WorkflowModelSettings
                  defaultValue={
                    (workflow?.modelSettings as ModelSettings) ?? {}
                  }
                  onChange={(val) => {
                    setModelSettings(val);
                  }}
                />
              ) : null}

              <Input
                type="hidden"
                name="modelSettings"
                defaultValue={JSON.stringify(modelSettings)}
              />
            </div>
          </div>

          {!branchMode ? (
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
              >
                Name
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input
                  type="text"
                  name="name"
                  defaultValue={workflow?.name ?? ""}
                />
              </div>
            </div>
          ) : null}

          {branchMode ? (
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="name"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
              >
                Name
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input
                  type="text"
                  name="branchShortId"
                  defaultValue={branchShortId}
                />
              </div>
            </div>
          ) : null}

          {modelHasInstruction[model] ? (
            <div className="mt-10 space-y-8 border-b pb-12 sm:space-y-0 sm:divide-y sm:border-t sm:pb-0">
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="instruction"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
                >
                  Instruction
                </label>
                <div className="mt-2 sm:col-span-2 sm:mt-0">
                  <Textarea
                    name="instruction"
                    rows={8}
                    value={instruction}
                    onChange={(e) => {
                      setInstruction(e.target.value);
                      updateInputs({ instruction: e.target.value });
                    }}
                  />
                  <p className="mt-3 text-sm leading-6 text-primary">
                    Write the edit instruction, you can insert varibles using
                    this syntax <span>{"{{ variable }}"}</span>.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-10 space-y-8 border-b pb-12 sm:space-y-0 sm:divide-y sm:border-t sm:pb-0">
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="template"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
              >
                Request template
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Textarea
                  name="template"
                  rows={8}
                  value={template}
                  onChange={(e) => {
                    setTemplate(e.target.value);
                    updateInputs({ template: e.target.value });
                  }}
                />
                <p className="mt-3 text-sm leading-6 text-primary">
                  Write the prompt template, you can insert varibles using this
                  syntax <span>{"{{ variable }}"}</span>.
                </p>
              </div>
            </div>
          </div>

          <input type="hidden" name="inputs" value={JSON.stringify(inputs)} />

          {inputs?.length ? (
            <div className="mt-10 space-y-8 border-b pb-12 sm:space-y-0 sm:divide-y sm:border-t sm:pb-0">
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="template"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
                >
                  Input configurator
                </label>
                <div className="mt-2 sm:col-span-2 sm:mt-0">
                  {inputs.map(({ name, label, type }) => (
                    <div
                      key={name}
                      className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6"
                    >
                      <div className="sm:col-span-2 sm:col-start-1">
                        <div className="mt-2">
                          <Input type="text" value={name} disabled />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <div className="mt-2">
                          <Input
                            type="text"
                            placeholder="Label"
                            value={label ?? ""}
                            onChange={(e) => {
                              const newInputs = [...inputs];
                              newInputs.find((i) => i.name === name)!.label =
                                e.target.value;
                              setInputs(newInputs);
                            }}
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <div className="mt-2">
                          <Select
                            value={type ?? "text"}
                            onValueChange={(val) => {
                              const newInputs = [...inputs];
                              newInputs.find((i) => i.name === name)!.type =
                                val as WorkflowInputType;
                              setInputs(newInputs);
                            }}
                          >
                            <SelectTrigger className="w-[240px]">
                              <SelectValue placeholder="Model" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.keys(WorkflowInputType).map((type) => (
                                <SelectItem
                                  key={type}
                                  value={type}
                                  className="capitalize"
                                >
                                  {WorkflowInputTypeToLabel[type]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {!branchMode ? (
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="cacheControlTtl"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
              >
                Cached Response TTL
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0 space-y-2">
                <p className="text-sm leading-6 text-secondary-foreground">
                  Time to live for the cached response in seconds.
                </p>
                <Input
                  type="text"
                  name="cacheControlTtl"
                  defaultValue={workflow?.cacheControlTtl ?? 0}
                />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-x-6 mt-6">
          <Link
            href={workflow ? `/workflows/${workflow.id}` : "/workflows"}
            className={buttonVariants({ variant: "link" })}
            prefetch={false}
          >
            Cancel
          </Link>
          <SaveButton />
        </div>
      </div>
    </form>
  );
}
