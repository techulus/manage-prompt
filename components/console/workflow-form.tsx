"use client";

import { WorkflowModels } from "@/data/workflow";
import { Workflow } from "@prisma/client";
import { useState } from "react";

interface Props {
  workflow?: Workflow;
}

export function WorkflowForm({ workflow }: Props) {
  const [model, setModel] = useState(workflow?.model ?? WorkflowModels.chat);

  return (
    <div className="space-y-12 sm:space-y-16">
      <div>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
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
              className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
            >
              Model
            </label>
            <div className="mt-2 sm:col-span-2 sm:mt-0">
              <select
                id="model"
                name="model"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6 capitalize"
                value={model}
                onChange={(e) => setModel(e.target.value)}
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
              className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
            >
              Name
            </label>
            <div className="mt-2 sm:col-span-2 sm:mt-0">
              <input
                type="text"
                name="name"
                id="name"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:max-w-xs sm:text-sm sm:leading-6"
                defaultValue={workflow?.name ?? ""}
              />
            </div>
          </div>

          {model === WorkflowModels.edit || model === WorkflowModels.code ? (
            <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
              <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                <label
                  htmlFor="instruction"
                  className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
                >
                  Instruction
                </label>
                <div className="mt-2 sm:col-span-2 sm:mt-0">
                  <textarea
                    id="instruction"
                    name="instruction"
                    rows={3}
                    className="block w-full max-w-2xl rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    defaultValue={workflow?.instruction ?? ""}
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
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Request template
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <textarea
                  id="template"
                  name="template"
                  rows={3}
                  className="block w-full max-w-2xl rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  defaultValue={workflow?.template ?? ""}
                />
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Write the prompt template, you can insert varibles using this
                  syntax <span>{`{{ variable }}`}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
