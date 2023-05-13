"use client";

import { runWorkflow } from "@/app/console/workflows/actions";
import { WorkflowInput, WorkflowModels } from "@/data/workflow";
import { useAuth } from "@clerk/nextjs";
import { Tab } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/20/solid";
import { Workflow } from "@prisma/client";
import classNames from "classnames";
import { useMemo, useReducer } from "react";

interface Props {
  workflow: Workflow;
}

export function WorkflowComposer({ workflow }: Props) {
  const { userId } = useAuth();
  const { id, inputs, template, instruction, model } = workflow;

  const [inputValues, updateInput] = useReducer((state: any, action: any) => {
    return {
      ...state,
      ...action,
    };
  }, {});

  const generatedTemplate = useMemo(() => {
    let result = template;

    Object.keys(inputValues).forEach((key) => {
      result = result.replace(`{{${key}}}`, inputValues[key]);
    });

    return result;
  }, [inputValues, template]);

  const geneatedInstruction = useMemo(() => {
    let result = instruction ?? "";

    Object.keys(inputValues).forEach((key) => {
      result = result.replace(`{{${key}}}`, inputValues[key]);
    });

    return result;
  }, [inputValues, instruction]);

  return (
    <form className="p-6" action={runWorkflow}>
      <input
        type="number"
        name="id"
        id="id"
        className="hidden"
        defaultValue={Number(id)}
      />
      <input
        type="text"
        name="userId"
        id="userId"
        className="hidden"
        defaultValue={userId!}
      />
      <input
        type="text"
        name="model"
        id="model"
        className="hidden"
        defaultValue={model!}
      />
      <input
        type="text"
        name="content"
        id="content"
        className="hidden"
        value={generatedTemplate}
        onChange={() => null}
      />
      <input
        type="text"
        name="instruction"
        id="instruction"
        className="hidden"
        value={geneatedInstruction}
        onChange={() => null}
      />

      {!workflow.published ? (
        <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon
                className="h-5 w-5 text-yellow-400"
                aria-hidden="true"
              />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This workflow is not published and hence cannot be run.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <Tab.Group>
        {({ selectedIndex }) => (
          <>
            <Tab.List className="flex items-center">
              <Tab
                className={({ selected }) =>
                  classNames(
                    selected
                      ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                    "rounded-md border border-transparent px-3 py-1.5 text-sm font-medium"
                  )
                }
              >
                Write
              </Tab>
              <Tab
                className={({ selected }) =>
                  classNames(
                    selected
                      ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                      : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                    "ml-2 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium"
                  )
                }
              >
                Preview
              </Tab>
            </Tab.List>

            <Tab.Panels className="mt-2">
              <Tab.Panel className="-m-0.5 rounded-lg p-0.5">
                <label htmlFor="comment" className="sr-only">
                  Comment
                </label>
                {(inputs as [])?.length ? (
                  <div className="space-y-4">
                    {(inputs as WorkflowInput[]).map(({ name }) => (
                      <div
                        key={name}
                        className="rounded-md px-3 pb-1.5 pt-2.5 shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-blue-600"
                      >
                        <label
                          htmlFor="name"
                          className="block text-xs font-medium text-gray-900 uppercase"
                        >
                          {name}
                        </label>
                        <textarea
                          rows={3}
                          className="block w-full border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                          placeholder={`Enter value for ${name}`}
                          value={inputValues[name] ?? ""}
                          onChange={(e) =>
                            updateInput({ [name]: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>There are no inputs!</p>
                )}
              </Tab.Panel>

              <Tab.Panel className="-m-0.5 rounded-lg p-0.5">
                <div className="border-b">
                  {model === WorkflowModels.edit ||
                  model === WorkflowModels.code ? (
                    <div className="mx-px mt-px px-3 pb-12 pt-2 text-sm leading-5 text-gray-800 whitespace-pre-wrap">
                      {geneatedInstruction}
                    </div>
                  ) : null}
                  <div className="mx-px mt-px px-3 pb-12 pt-2 text-sm leading-5 text-gray-800 whitespace-pre-wrap">
                    {generatedTemplate}
                  </div>
                </div>
              </Tab.Panel>
            </Tab.Panels>
          </>
        )}
      </Tab.Group>
      <div className="mt-2 flex justify-end">
        <button
          type="submit"
          className={classNames(
            "inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
            "disabled:bg-gray-400 disabled:cursor-not-allowed"
          )}
          disabled={
            !workflow.published ||
            Object.keys(inputValues).length !==
              (inputs as WorkflowInput[])?.length
          }
        >
          Run
        </button>
      </div>
    </form>
  );
}
