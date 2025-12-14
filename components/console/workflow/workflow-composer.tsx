"use client";

import { useMemo, useReducer, useState } from "react";
import { toast } from "sonner";
import {
  modelHasInstruction,
  type WorkflowInput,
  WorkflowInputType,
} from "@/data/workflow";
import type { Workflow } from "@/generated/prisma-client/client";
import { ApiCodeSnippet } from "../../code/snippet";
import { Spinner } from "../../core/loaders";
import StreamingText from "../../core/streaming-text";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Textarea } from "../../ui/textarea";

interface Props {
  workflow: Workflow;
  apiSecretKey?: string;
  branch?: string;
}

export function WorkflowComposer({ workflow, apiSecretKey }: Props) {
  const { template, instruction, model } = workflow;
  const inputs = (workflow.inputs ?? []) as WorkflowInput[];

  const [inputValues, updateInput] = useReducer((state: any, action: any) => {
    return {
      ...state,
      ...action,
    };
  }, {});

  const [isLoading, setIsLoading] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleRunWorkflow = async () => {
    if (!apiSecretKey) {
      toast.error("API key not available");
      return;
    }

    setIsLoading(true);
    setStreamUrl(null);
    setError(null);

    try {
      const tokenResponse = await fetch("/api/v1/token", {
        headers: {
          Authorization: `Bearer ${apiSecretKey}`,
        },
      });

      if (!tokenResponse.ok) {
        throw new Error("Failed to get streaming token");
      }

      const { token } = await tokenResponse.json();
      setStreamUrl(`/api/v1/run/${workflow.shortId}/stream?token=${token}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to run workflow";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStreamUrl(null);
    setError(null);
  };

  return (
    <div className="p-6">
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
              <div className="grid w-full items-center gap-1.5">
                <Label className="uppercase">MODEL</Label>
                <p>{workflow.model}</p>
              </div>

              {(inputs as WorkflowInput[]).map(
                ({ name, type = WorkflowInputType.text, label }) => (
                  <div key={name} className="grid w-full items-center gap-1.5">
                    <Label className="uppercase">{label ?? name}</Label>

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
                      WorkflowInputType.url,
                    ].includes(type) ? (
                      <Input
                        type={type}
                        placeholder={`Enter ${type}`}
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
              <Button
                onClick={handleRunWorkflow}
                disabled={
                  !workflow.published ||
                  !apiSecretKey ||
                  isLoading ||
                  !!streamUrl ||
                  Object.keys(inputValues).length !==
                    (inputs as WorkflowInput[])?.length
                }
              >
                {isLoading ? <Spinner message="Loading..." /> : "Run"}
              </Button>
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
            <Button
              onClick={handleRunWorkflow}
              disabled={
                !workflow.published ||
                !apiSecretKey ||
                isLoading ||
                !!streamUrl ||
                Object.keys(inputValues).length !==
                  (inputs as WorkflowInput[])?.length
              }
            >
              {isLoading ? <Spinner message="Loading..." /> : "Run"}
            </Button>
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
                    (acc, input) =>
                      Object.assign(acc, {
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
            <span className="p-1 border border-secondary font-mono text-primary bg-secondary">
              {workflow.shortId}
            </span>
          </div>
        </TabsContent>
      </Tabs>

      {streamUrl && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-lg font-semibold mb-3">Result</h3>
          <div className="border rounded-lg p-4 bg-slate-50 dark:bg-slate-900">
            <StreamingText
              url={streamUrl}
              body={inputValues}
              fallbackText="Failed to process workflow"
              className="text-sm leading-5 text-slate-800 dark:text-slate-100 whitespace-pre-wrap"
              onCompleted={() => toast.success("Workflow completed")}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleReset} variant="outline">
              Run Again
            </Button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 border border-red-300 rounded-lg bg-red-50 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
    </div>
  );
}
