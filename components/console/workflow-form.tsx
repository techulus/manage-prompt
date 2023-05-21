"use client";

import {
  WorkflowInput,
  WorkflowInputType,
  WorkflowModels,
} from "@/data/workflow";
import { parseInputs } from "@/utils/workflow";
import { Workflow } from "@prisma/client";
import { useCallback, useState } from "react";

interface Props {
  workflow?: Workflow;
}

export function WorkflowForm({ workflow }: Props) {
  const [model, setModel] = useState(workflow?.model ?? WorkflowModels.chat);
  const [template, setTemplate] = useState(workflow?.template ?? "");
  const [instruction, setInstruction] = useState(workflow?.instruction ?? "");
  const [inputs, setInputs] = useState<WorkflowInput[]>(
    (workflow?.inputs as WorkflowInput[]) ?? []
  );

  const updateInputs = useCallback(
    (value: any) => {
      const updatedValue = { template, instruction, model, ...value };

      if (model === WorkflowModels.edit || model === WorkflowModels.code) {
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
    <div className="space-y-12 sm:space-y-16">
      <div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
          A workflow is a AI prompt with a pre-defined set of inputs &
          configuration.
        </p>

        {workflow?.id ? (
          <input
            type="number"
            name="id"
            id="id"
            className="hidden"
            defaultValue={Number(workflow?.id)}
          />
        ) : null}

        <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label
              htmlFor="model"
              className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
            >
              Model
            </label>
            <div className="mt-2 sm:col-span-2 sm:mt-0">
              <select
                id="model"
                name="model"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6 dark:bg-gray-900 dark:ring-gray-800 capitalize"
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  updateInputs({ model: e.target.value });
                }}
              >
                {Object.keys(WorkflowModels).map((model) => (
                  <option key={model} value={WorkflowModels[model]}>
                    {model} ({WorkflowModels[model]})
                  </option>
                ))}
              </select>
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
              <input
                type="text"
                name="name"
                id="name"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6 dark:bg-gray-900 dark:ring-gray-800"
                defaultValue={workflow?.name ?? ""}
              />
            </div>
          </div>

          {model === WorkflowModels.edit || model === WorkflowModels.code ? (
            <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="instruction"
                  className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
                >
                  Instruction
                </label>
                <div className="mt-2 sm:col-span-2 sm:mt-0">
                  <textarea
                    id="instruction"
                    name="instruction"
                    rows={3}
                    className="block w-full max-w-2xl rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:ring-gray-800"
                    value={instruction}
                    onChange={(e) => {
                      setInstruction(e.target.value);
                      updateInputs({ instruction: e.target.value });
                    }}
                  />
                  <p className="mt-3 text-sm leading-6 text-gray-600">
                    Write the edit instruction, you can insert varibles using
                    this syntax <span>{`{{ variable }}`}</span>.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="template"
                className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
              >
                Request template
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <textarea
                  id="template"
                  name="template"
                  rows={3}
                  className="block w-full max-w-2xl rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:ring-gray-800"
                  value={template}
                  onChange={(e) => {
                    setTemplate(e.target.value);
                    updateInputs({ template: e.target.value });
                  }}
                />
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Write the prompt template, you can insert varibles using this
                  syntax <span>{`{{ variable }}`}</span>.
                </p>
              </div>
            </div>
          </div>

          <input type="hidden" name="inputs" value={JSON.stringify(inputs)} />

          {inputs?.length ? (
            <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
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
                          <input
                            type="text"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-950 dark:bg-gray-900 dark:ring-gray-800"
                            placeholder="Name"
                            value={name}
                            onChange={() => {}}
                            disabled
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <div className="mt-2">
                          <input
                            type="text"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:ring-gray-800"
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
                          <select
                            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 dark:bg-gray-900 dark:ring-gray-800"
                            value={type ?? "text"}
                            onChange={(e) => {
                              const newInputs = [...inputs];
                              newInputs.find((i) => i.name === name)!.type = e
                                .target.value as WorkflowInputType;
                              setInputs(newInputs);
                            }}
                          >
                            {Object.keys(WorkflowInputType).map((type) => (
                              <option
                                key={type}
                                value={type}
                                className="capitalize"
                              >
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
