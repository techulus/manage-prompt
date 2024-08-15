"use client";

import { ChatBot } from "@prisma/client";
import { PlusCircleIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { notifyError, notifySuccess } from "../../core/toast";
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

interface Props {
  chatbot?: ChatBot;
  action: (data: FormData) => Promise<any>;
}

const itemTypeToFileExtension = {
  text: ".txt",
  pdf: ".pdf",
  csv: ".csv",
};

export function ChatbotForm({ chatbot, action }: Props) {
  const [model, setModel] = useState("gpt-4o");
  const [contextItems, setContextItems] = useState<
    { type: string; source: string }[]
  >(
    chatbot?.contextItems
      ? JSON.parse(JSON.stringify(chatbot?.contextItems))
      : [],
  );

  return (
    <form
      className="space-y-12 sm:space-y-16 mt-2"
      action={async (data: FormData) => {
        const result = await action(data);
        if (result?.error) {
          notifyError(result.error);
        } else {
          notifySuccess("Chatbot created successfully");
        }
      }}
    >
      <div>
        {chatbot?.id ? (
          <input
            name="id"
            id="id"
            className="hidden"
            defaultValue={chatbot?.id}
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
                }}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">gpt-4o</SelectItem>
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
                defaultValue={chatbot?.name ?? ""}
              />
            </div>
          </div>

          <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
            <label
              htmlFor="context"
              className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200 sm:pt-1.5"
            >
              Context
            </label>
            <div className="mt-2 sm:col-span-2 sm:mt-0">
              <p className="text-sm text-primary-muted pb-6">
                Adding context helps the AI provide more accurate and
                contextually relevant answers by leveraging external data
                sources. This approach ensures that the responses are better
                informed and tailored to the specific needs of the conversation.
              </p>

              {contextItems.map((item, index) => {
                if (item.type === "html") {
                  return (
                    <div key={index} className="flex items-center gap-x-4 pb-6">
                      <Input
                        type="hidden"
                        name={`contextItemsTypes[]`}
                        defaultValue={item.type}
                      />
                      <Input
                        type="text"
                        name={`contextItemsSources[]`}
                        defaultValue={item.source}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setContextItems((prev) =>
                            prev.filter((_, i) => i !== index),
                          );
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                }

                if (item.type === "pdf" || item.type === "csv") {
                  return (
                    <div key={index} className="flex items-center gap-x-4 pb-6">
                      <Input
                        type="hidden"
                        name={`contextItemsTypes[]`}
                        defaultValue={item.type}
                      />
                      <Input
                        type="file"
                        name={`contextItemsSources[]`}
                        accept={itemTypeToFileExtension[item.type]}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setContextItems((prev) =>
                            prev.filter((_, i) => i !== index),
                          );
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                }

                return null;
              })}

              <div className="flex space-x-2">
                {[
                  {
                    type: "html",
                    label: "Webpage",
                  },
                  {
                    type: "pdf",
                    label: "PDF",
                  },
                  {
                    type: "csv",
                    label: "CSV",
                  },
                ].map(({ type, label }) => (
                  <Button
                    key={type}
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setContextItems((prev) => [
                        ...prev,
                        {
                          type,
                          source: "",
                        },
                      ]);
                    }}
                  >
                    <PlusCircleIcon className="size-4" />
                    <span className="ml-2">{label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-6 mt-6">
          <Link
            href="/console/chatbots"
            className={buttonVariants({ variant: "link" })}
            prefetch={false}
          >
            Cancel
          </Link>

          <SaveButton
            label={chatbot ? "Save" : "Create"}
            loadingLabel={chatbot ? "Saving..." : "Creating..."}
          />
        </div>
      </div>
    </form>
  );
}
