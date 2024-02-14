"use client";

import { runWorkflow } from "@/app/console/workflows/actions";
import {
  WorkflowInput,
  WorkflowInputType,
  modelHasInstruction,
} from "@/data/workflow";
import { SignedIn } from "@clerk/nextjs";
import { Workflow } from "@prisma/client";
import { useMemo, useReducer } from "react";
import { SaveButton } from "../form/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
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

        <Tabs defaultValue="compose">
          <TabsList>
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="review">Review</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
          </TabsList>
          <TabsContent value="compose">
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
          </TabsContent>
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
          </TabsContent>
          <TabsContent value="deploy">
            <iframe
              src={`https//api.apiembed.com/?source=${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/run/${workflow.shortId}/har&targets=shell:curl,node:unirest,java:unirest,python:requests,php:curl,ruby:native,objc:nsurlsession,go:native`}
              width="100%"
              height="500px"
              seamless
            ></iframe>
          </TabsContent>
        </Tabs>

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
