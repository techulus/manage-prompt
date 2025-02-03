"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  type WorkflowInput,
  WorkflowInputType,
  WorkflowTestCondition,
} from "@/data/workflow";
import type { Workflow } from "@prisma/client";
import Link from "next/link";
import { useReducer } from "react";
import { notifyError, notifySuccess } from "../../core/toast";
import { SaveButton } from "../../form/button";
import { buttonVariants } from "../../ui/button";
import { Input } from "../../ui/input";

interface Props {
  workflow: Workflow;
  action: (data: FormData) => Promise<any>;
}

export function WorkflowTestForm({ workflow, action }: Props) {
  const inputs: WorkflowInput[] = (workflow?.inputs as WorkflowInput[]) ?? [];

  const [inputValues, updateInput] = useReducer((state: any, action: any) => {
    return {
      ...state,
      ...action,
    };
  }, {});

  return (
    <form
      className="space-y-12 sm:space-y-16"
      action={async (data: FormData) => {
        const result = await action(data);
        if (result?.error) {
          notifyError(result.error);
        } else {
          notifySuccess("Done");
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

        {inputValues ? (
          <input
            type="text"
            name="input"
            className="hidden"
            value={JSON.stringify(inputValues)}
          />
        ) : null}

        <div className="w-full">
          {inputs?.length ? (
            <div className="flex flex-col sm:flex-row sm:space-x-2 w-full space-between">
              <div className="flex-1 flex-col space-y-2">
                <h3 className="font-semibold">For Inputs</h3>
                {(inputs as WorkflowInput[]).map(
                  ({ name, type = WorkflowInputType.text, label }) => (
                    <div key={name} className="grid items-center gap-1.5">
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
                  )
                )}
              </div>

              <div className="flex-1 flex-inline space-y-1 sm:pl-4">
                <h3 className="font-semibold">Test</h3>
                <Label className="uppercase">Result</Label>
                <Select name="condition">
                  <SelectTrigger className="w-[240px]">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(WorkflowTestCondition).map((condition) => (
                      <SelectItem key={condition} value={condition}>
                        {WorkflowTestCondition[condition]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label className="uppercase mt-2">Value</Label>
                <Input name="output" />
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-x-6 mt-6">
          <Link
            href={`/workflows/${workflow.id}/tests`}
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
