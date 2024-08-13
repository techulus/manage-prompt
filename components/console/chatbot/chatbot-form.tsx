"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlusCircleIcon } from "@/node_modules/lucide-react";
import { ChatBot } from "@prisma/client";
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
      className="space-y-12 sm:space-y-16"
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
              {contextItems.map((item, index) => (
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
              ))}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline">
                    <PlusCircleIcon className="size-4" />
                    <span className="ml-2">Add</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="m-0 p-0">
                    <Button
                      type="button"
                      variant="ghost"
                      className="m-0 p-0 w-full"
                      onClick={() => {
                        setContextItems((prev) => [
                          ...prev,
                          {
                            type: "html",
                            source: "",
                          },
                        ]);
                      }}
                    >
                      Webpage
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
