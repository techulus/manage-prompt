"use client";

import PageSection from "@/components/core/page-section";
import { ActionButton } from "@/components/form/button";
import PageTitle from "@/components/layout/page-title";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChat } from "ai/react";
import { CornerDownLeft, Globe, LightbulbOff, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import PageLoading from "../loading";
import {
  addContext,
  clearChatHistory,
  clearContextData,
  getChatHistory,
  reportChatUsage,
} from "./actions";

function ChatDashboard() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    messages,
    setMessages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
  } = useChat({
    api: "/api/chat",
    initialInput: "",
    onFinish: (response) => {
      if (response?.content) {
        const totalTokens = response?.content.split(" ").length * 0.7;
        reportChatUsage(totalTokens);
      }

      if (window?.scrollTo)
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
    },
  });

  useEffect(() => {
    setLoading(true);
    getChatHistory()
      .then((history) => {
        setMessages(history);
      })
      .finally(() => setLoading(false));
  }, [setMessages]);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <>
      <PageTitle title="Chat" />

      <PageSection topInset>
        <TooltipProvider>
          <div className="relative flex h-full min-h-[60vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
            <Badge variant="outline" className="absolute right-3 top-3">
              Output
            </Badge>
            <div className="flex-1">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col gap-4 p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="hidden md:block w-8 h-8 border">
                      <AvatarFallback>
                        {message.role.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <div className="font-bold">{message.role}</div>
                      <div className="prose text-muted-foreground">
                        <ReactMarkdown className="prose dark:prose-invert max-w-none prose-a:text-primary">
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring "
              x-chunk="dashboard-03-chunk-1"
            >
              <Label htmlFor="message" className="sr-only">
                Message
              </Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                className="min-h-12 resize-none border-0 p-3 shadow-none focus-visible:ring-0"
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmit();
                    setTimeout(() => {
                      setInput("");
                    }, 50);
                  }
                }}
              />
              <div className="flex items-center p-3 pt-0">
                <Dialog open={open}>
                  <DialogTrigger
                    className={buttonVariants({ variant: "ghost" })}
                    onClick={() => setOpen(true)}
                  >
                    <Globe className="size-4" />
                    <p className="hidden md:block md:ml-2">Chat with Website</p>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Chat with Website</DialogTitle>
                    </DialogHeader>
                    <form
                      action={async (formData) => {
                        addContext(formData).then(() => {
                          setOpen(false);
                        });
                      }}
                      className="space-y-4"
                    >
                      <p className="text-muted-foreground">
                        You can ask questions, get summaries, find information,
                        and more.
                      </p>
                      <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="email">Provide URL</Label>
                        <input type="hidden" name="type" value="html" />
                        <Input
                          type="url"
                          id="url"
                          name="url"
                          placeholder="Url..."
                          className="w-full"
                        />
                      </div>
                      <ActionButton variant="default" label="Save" />
                    </form>
                  </DialogContent>
                </Dialog>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <form
                      action={async () => {
                        setMessages([]);
                        await toast.promise(clearChatHistory(), {
                          loading: "Deleting chat history...",
                          success: "Chat history deleted",
                          error: "Failed to delete chat history",
                        });
                      }}
                    >
                      <Button variant="ghost" size="icon">
                        <Trash2Icon className="size-4" />
                        <span className="sr-only">Clear history</span>
                      </Button>
                    </form>
                  </TooltipTrigger>
                  <TooltipContent side="top">Clear history</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <form
                      action={async () => {
                        toast.promise(clearContextData(), {
                          loading: "Deleting learned data...",
                          success: "Learned data deleted",
                          error: "Failed to delete learned data",
                        });
                      }}
                    >
                      <Button variant="ghost" size="icon">
                        <LightbulbOff className="size-4" />
                        <span className="sr-only">Delete learned data</span>
                      </Button>
                    </form>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Delete learned data
                  </TooltipContent>
                </Tooltip>

                <form onSubmit={handleSubmit} className="ml-auto gap-1.5">
                  <Button type="submit" size="sm">
                    Send
                    <CornerDownLeft className="size-3.5 ml-2" />
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </TooltipProvider>
      </PageSection>
    </>
  );
}

export default ChatDashboard;
