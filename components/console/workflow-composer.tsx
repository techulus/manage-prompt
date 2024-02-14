"use client";

import { runWorkflow } from "@/app/console/workflows/actions";
import {
  WorkflowInput,
  WorkflowInputType,
  modelHasInstruction,
} from "@/data/workflow";
import { SignedIn } from "@clerk/nextjs";
import { Tab } from "@headlessui/react";
import { Workflow } from "@prisma/client";
import classNames from "classnames";
import { useMemo, useReducer } from "react";
import { SaveButton } from "../form/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface Props {
  workflow: Workflow;
}

export function WorkflowComposer({ workflow }: Props) {
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
    <>
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

        <Tab.Group>
          {() => (
            <>
              <Tab.List className="flex items-center">
                <Tab
                  className={({ selected }) =>
                    classNames(
                      selected
                        ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
                        : "bg-white text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                      selected
                        ? "dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
                        : "dark:bg-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
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
                      selected
                        ? "dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-700 dark:hover:text-white"
                        : "dark:bg-black dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                      "ml-2 rounded-md border border-transparent px-3 py-1.5 text-sm font-medium"
                    )
                  }
                >
                  Preview
                </Tab>
              </Tab.List>

              <Tab.Panels className="mt-2">
                <Tab.Panel className="-m-0.5 rounded-lg p-0.5">
                  {(inputs as [])?.length ? (
                    <div className="mt-4 space-y-4">
                      {(inputs as WorkflowInput[]).map(
                        ({ name, type = WorkflowInputType.text, label }) => (
                          <div
                            key={name}
                            className="grid w-full items-center gap-1.5"
                          >
                            <Label>{label ?? name}</Label>

                            {type === WorkflowInputType.textarea ? (
                              <Textarea
                                rows={5}
                                placeholder={`Enter value for ${name}`}
                                value={inputValues[name] ?? ""}
                                onChange={(e) =>
                                  updateInput({ [name]: e.target.value })
                                }
                              />
                            ) : null}

                            {[
                              WorkflowInputType.text,
                              WorkflowInputType.date,
                              WorkflowInputType.number,
                            ].includes(type) ? (
                              <Input
                                type={type}
                                placeholder={`Enter value for ${name}`}
                                value={inputValues[name] ?? ""}
                                onChange={(e) =>
                                  updateInput({ [name]: e.target.value })
                                }
                              />
                            ) : null}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="dark:text-white">
                      There are no inputs, you can run the workflow!
                    </p>
                  )}
                </Tab.Panel>

                <Tab.Panel className="-m-0.5 rounded-lg p-0.5">
                  <div className="border-b">
                    {modelHasInstruction[model] ? (
                      <div className="mx-px mt-px px-3 pb-12 pt-2 text-sm leading-5 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 whitespace-pre-wrap">
                        <span className="font-semibold">Instruction:</span>{" "}
                        {geneatedInstruction}
                      </div>
                    ) : null}
                    <div className="mx-px mt-px px-3 pb-12 pt-2 text-sm leading-5 text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 whitespace-pre-wrap">
                      {generatedTemplate}
                    </div>
                  </div>
                </Tab.Panel>
              </Tab.Panels>
            </>
          )}
        </Tab.Group>

        <SignedIn>
          <div className="mt-2 flex justify-end">
            <SaveButton
              label="Run"
              loadingLabel="Running"
              disabled={
                !workflow.published ||
                Object.keys(inputValues).length !==
                  (inputs as WorkflowInput[])?.length
              }
            />
          </div>
        </SignedIn>
      </form>
    </>
  );
}
