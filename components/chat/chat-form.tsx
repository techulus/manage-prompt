"use client";

import { ContentBlock } from "@/components/core/content-block";
import { Spinner } from "@/components/core/loaders";
import { notifyError } from "@/components/core/toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  BoltIcon,
  PaperAirplaneIcon,
  UserIcon,
} from "@heroicons/react/20/solid";

import { updateSettings } from "@/lib/hooks/user";
import { Message, useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type Props = {
  defaultModel: string;
};

export default function ChatForm({ defaultModel }: Props) {
  const [model, setModel] = useState(defaultModel ?? "gpt-4-1106-preview");
  const {
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    stop,
    isLoading,
  } = useChat({
    onError: (error: Error) => {
      console.error(error);
      notifyError("Something went wrong, please try again.");
    },
  });
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (messages.length) {
      localStorage.setItem("messages", JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    const messages = localStorage.getItem("messages");
    if (messages) {
      setMessages(JSON.parse(messages));
    }
  }, [setMessages]);

  return (
    <>
      <ContentBlock>
        <div className="hidden md:flex h-12 flex-col justify-center border-b border-gray-200 dark:border-gray-800">
          <div className="px-4 sm:px-6 lg:px-8 lg:-mx-4">
            <div className="flex justify-between py-3">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Chat Model
                </p>
                <Select
                  value={model}
                  onValueChange={async (value) => {
                    setModel(value);
                    await updateSettings({ chat_model: value });
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-3.5-turbo">GPT-3</SelectItem>
                    <SelectItem value="gpt-4-1106-preview">GPT-4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </ContentBlock>

      <ContentBlock className="flex flex-grow overflow-y-scoll">
        <CardContent className="content-block w-full overflow-x-scroll">
          {!messages.length ? (
            <div className="w-full text-gray-400 text-center p-10">
              No messages yet. Start the conversation!
            </div>
          ) : null}

          {messages.map((message: Message) => (
            <div className="flex items-center mt-4" key={message.id}>
              <p className="font-bold tracking-tight mt-1 self-start">
                <Avatar>
                  <AvatarFallback>
                    {message.role === "user" ? (
                      <UserIcon className="w-5 h-5" />
                    ) : (
                      <BoltIcon className="w-5 h-5 text-blue-600" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </p>
              <div className="ml-2 flex flex-col prose justify-center">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </CardContent>
      </ContentBlock>

      <form
        className="w-full max-w-3xl mx-auto flex-shrink-0 mt-8"
        onSubmit={handleSubmit}
      >
        <CardContent className="flex flex-col md:flex-row mt-4 space-y-2 md:space-y-0 md:space-x-4">
          <Textarea
            placeholder="Send a message..."
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                btnRef.current?.click();
              }
            }}
          />
          {isLoading ? (
            <Button type="button" onClick={stop}>
              <Spinner className="mr-2" /> Cancel
            </Button>
          ) : (
            <div className="flex md:flex-col md:space-y-2">
              <Button type="submit" ref={btnRef}>
                <PaperAirplaneIcon className="w-5 h-5 mr-2" /> Send
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setMessages([]);
                  localStorage.removeItem("messages");
                }}
                className="ml-auto md:ml-0"
              >
                Clear
              </Button>
            </div>
          )}
        </CardContent>
      </form>
    </>
  );
}
