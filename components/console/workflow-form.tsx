"use client";

import {
  AIModelToLabel,
  AIModels,
  WorkflowInput,
  WorkflowInputType,
  modelHasInstruction,
} from "@/data/workflow";
import { parseInputs } from "@/lib/utils/workflow";
import { Workflow } from "@prisma/client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { notifyError, notifySuccess } from "../core/toast";
import { SaveButton } from "../form/button";
import { buttonVariants } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

interface Props {
  workflow?: Workflow;
  action: (data: FormData) => Promise<any>;
}

export function WorkflowForm({ workflow, action }: Props) {
  const [model, setModel] = useState(workflow?.model ?? AIModels[0]);
  const [template, setTemplate] = useState(workflow?.template ?? "");
  const [instruction, setInstruction] = useState(workflow?.instruction ?? "");
  const [inputs, setInputs] = useState<WorkflowInput[]>(
    (workflow?.inputs as WorkflowInput[]) ?? []
  );

  const updateInputs = useCallback(
    (value: any) => {
      const updatedValue = { template, instruction, model, ...value };

      if (modelHasInstruction[model]) {
        setInputs(
          parseInputs(`${updatedValue.template} ${updatedValue.instruction}`)
        );
      } else {
        setInputs(parseInputs(updatedValue.template));
      }
    },
    [template, instruction, model]
  );

  return (
    <form
      className="space-y-12 sm:space-y-16"
      action={async (data: FormData) => {
        const result = await action(data);
        if (result?.error) {
          notifyError(result.error);
        } else {
          notifySuccess("Workflow saved successfully");
        }
      }}
    >
      <div>
        {workflow?.id ? (
          <input
            type="number"
            name="id"
            id="id"
            className="hidden"
            defaultValue={Number(workflow?.id)}
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
            </div>
          </div>

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
                    this syntax <span>{`{{ variable }}`}</span>.
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
                  syntax <span>{`{{ variable }}`}</span>.
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
                                  {type}
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
        </div>

        <div className="flex items-center justify-end gap-x-6 mt-6">
          <Link
            href="/console/workflows"
            className={buttonVariants({ variant: "link" })}
          >
            Cancel
          </Link>
          <SaveButton />
        </div>
      </div>
    </form>
  );
}
