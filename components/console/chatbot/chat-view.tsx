"use client";

import { Spinner, SpinnerWithSpacing } from "@/components/core/loaders";
import MarkdownView from "@/components/markdown/markdown-view";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LightningBoltIcon } from "@radix-ui/react-icons";
import { useDebounce } from "@uidotdev/usehooks";
import { useChat } from "ai/react";
import { CornerDownLeft, Trash2Icon, UserIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

function ChatView({ token, isEmbed }: { token: string; isEmbed?: boolean }) {
  const [loading, setLoading] = useState(true);

  const {
    messages,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat({
    api: `/api/v1/chat/${token}/stream`,
    initialInput: "",
  });

  const debouncedMessages = useDebounce(messages, 250);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/v1/chat/${token}/history`)
      .then((res) => res.json())
      .then((history) => {
        setMessages(history);
      })
      .finally(() => setLoading(false));
  }, [token, setMessages]);

  const clearChatHistory = useCallback(async () => {
    setMessages([]);
    await toast.promise(
      fetch(`/api/v1/chat/${token}/history`, {
        method: "DELETE",
      }),
      {
        loading: "Deleting chat history...",
        success: "Chat history deleted",
        error: "Failed to delete chat history",
      }
    );
  }, [token, setMessages]);

  useEffect(() => {
    if (debouncedMessages.length && window?.scrollTo)
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
  }, [debouncedMessages]);

  if (loading) {
    return <SpinnerWithSpacing />;
  }

  return (
    <TooltipProvider>
      <div className="relative flex h-full min-h-[60vh] flex-col bg-muted/50 p-4 lg:col-span-2">
        <div className="flex-1 divide-y-2">
          {messages.map((message) => (
            <div key={message.id} className="flex flex-col py-4">
              <div className="flex items-start gap-4">
                <div className="hidden md:block size-6">
                  {message.role === "user" ? (
                    <UserIcon className="size-6" />
                  ) : (
                    <LightningBoltIcon
                      className="size-6 text-primary"
                      color="currentColor"
                    />
                  )}
                </div>
                <MarkdownView content={message.content} />
              </div>
            </div>
          ))}
        </div>
        <div className="sticky bottom-8 overflow-hidden border bg-background focus-within:ring-1 focus-within:ring-ring mt-6">
          <Label htmlFor="message" className="sr-only">
            Message
          </Label>
          <Textarea
            id="message"
            placeholder="Ask me anything, but please use discretion—I might make mistakes."
            className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
            value={input}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
                setTimeout(() => {
                  setInput("");
                }, 50);
              }
            }}
          />
          <div className="flex items-center p-3 pt-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={clearChatHistory}>
                  <Trash2Icon className="size-4" />
                  <span className="sr-only">Clear history</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Clear history</TooltipContent>
            </Tooltip>

            <form onSubmit={handleSubmit} className="ml-auto gap-1.5">
              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
                className={isLoading ? "animate-pulse" : ""}
              >
                {isLoading ? (
                  <Spinner />
                ) : (
                  <>
                    Send
                    <CornerDownLeft className="hidden lg:block size-3.5 ml-1" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {isEmbed ? (
            <a
              className="text-xs text-hero absolute bottom-2 text-primary left-[50%] transform -translate-x-1/2"
              target="_blank"
              rel="noopener noreferrer"
              href="https://manageprompt.com"
            >
              ⚡ by ManagePrompt
            </a>
          ) : null}
        </div>
      </div>
    </TooltipProvider>
  );
}

export default ChatView;
