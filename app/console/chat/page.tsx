"use client";

import { ContentBlock } from "@/components/core/content-block";
import { Spinner } from "@/components/core/loaders";
import PageTitle from "@/components/layout/page-title";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { PaperAirplaneIcon } from "@heroicons/react/20/solid";
import { Message, useChat } from "ai/react";
import { useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function Chat() {
  // TODO: handle errors
  const {
    stop,
    messages,
    setMessages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat();
  const btnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <PageTitle title="Chat" />

      <ContentBlock className="flex flex-grow overflow-y-scoll">
        <CardContent className="w-full py-4 space-y-4">
          {!messages.length ? (
            <div className="w-full text-gray-400 text-center p-10">
              No messages yet. Start the conversation!
            </div>
          ) : null}

          {messages.map((message: Message) => (
            <div className="flex flex-col space-y-2" key={message.id}>
              <p className="font-extrabold tracking-tight text-lg">
                {message.role === "user" ? "You" : "Assistant"}
              </p>
              <div className="flex flex-col prose justify-center">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          ))}
        </CardContent>
      </ContentBlock>

      <form className="flex-shrink-0" onSubmit={handleSubmit}>
        <ContentBlock className="mt-auto">
          <CardContent className="flex flex-col md:flex-row mt-4 space-y-2 md:space-y-0 md:space-x-4">
            <Textarea
              placeholder="Hello!"
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
                  onClick={() => setMessages([])}
                  className="ml-auto md:ml-0"
                >
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </ContentBlock>
      </form>
    </>
  );
}
