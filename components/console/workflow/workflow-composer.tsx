"use client";

import { runWorkflow } from "@/app/(dashboard)/console/workflows/actions";
import {
  modelHasInstruction,
  WorkflowInput,
  WorkflowInputType,
} from "@/data/workflow";
import { Workflow } from "@prisma/client";
import { useMemo, useReducer } from "react";
import { ApiCodeSnippet } from "../../code/snippet";
import { notifyError } from "../../core/toast";
import { SaveButton } from "../../form/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";

interface Props {
  workflow: Workflow;
  apiSecretKey?: string;
}

export function WorkflowComposer({ workflow, apiSecretKey }: Props) {
  const { id, template, instruction, model } = workflow;
  const inputs = (workflow.inputs ?? []) as WorkflowInput[];

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
      <form
        className="p-6"
        action={async (data: FormData) => {
          const result = await runWorkflow(data);
          if (result?.error) {
            notifyError(result.error as string);
          }
        }}
      >
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

        <Tabs defaultValue={inputs?.length ? "compose" : "review"}>
          <TabsList>
            {inputs?.length ? (
              <TabsTrigger value="compose">Compose</TabsTrigger>
            ) : null}
            <TabsTrigger value="review">Review</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
          </TabsList>
          {inputs?.length ? (
            <TabsContent value="compose">
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
                          rows={10}
                          placeholder={`Enter value for ${name}`}
                          value={inputValues[name] ?? ""}
                          onChange={(e) =>
                            updateInput({ [name]: e.target.value })
                          }
                        />
                      ) : null}

                      {[
                        WorkflowInputType.text,
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
                  ),
                )}
              </div>

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
            </TabsContent>
          ) : null}

          <TabsContent value="review">
            <div className="border-b">
              {modelHasInstruction[model] ? (
                <div className="mx-px mt-px px-3 pb-12 pt-2 text-sm leading-5 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 whitespace-pre-wrap">
                  <span className="font-semibold">Instruction:</span>{" "}
                  {geneatedInstruction}
                </div>
              ) : null}
              <div className="mx-px mt-px px-3 pb-12 pt-2 text-sm leading-5 text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-900 whitespace-pre-wrap">
                {generatedTemplate}
              </div>
            </div>

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
          </TabsContent>

          <TabsContent value="deploy">
            <ApiCodeSnippet
              har={{
                method: "POST",
                url: `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/v1/run/${workflow.shortId}`,
                queryString: [],
                headers: [
                  {
                    name: "Authorization",
                    value: `Bearer ${apiSecretKey ?? "api-secret-key"}`,
                  },
                  {
                    name: "Content-Type",
                    value: "application/json",
                  },
                ],
                postData: {
                  mimeType: "application/json",
                  text: JSON.stringify(
                    ((inputs ?? []) as WorkflowInput[]).reduce(
                      (acc, input) => ({
                        ...acc,
                        [input.name]: "value",
                      }),
                      {},
                    ),
                  ),
                },
              }}
            />
            <div className="mt-2 text-sm">
              ID:{" "}
              <span className="p-1 border border-secondary rounded-lg font-mono text-primary bg-secondary">
                {workflow.shortId}
              </span>
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </>
  );
}
