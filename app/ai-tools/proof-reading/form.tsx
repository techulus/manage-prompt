"use client";

import StreamingText from "@/components/core/streaming-text";
import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function ProofReadForm({ streamUrl }: { streamUrl: string }) {
  const [content, setContent] = useState("");
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);

  return ready ? (
    <div className="mt-6 text-gray-600 dark:text-gray-200">
      <div className="p-4 border rounded-md">
        <StreamingText
          url={streamUrl}
          body={{ content }}
          fallbackText="Failed to process"
          onCompleted={() => setLoading(false)}
          renderMarkdown
        />
      </div>
      {loading ? null : (
        <a
          href="/ai-tools/proof-reading"
          className={buttonVariants({
            variant: "default",
            size: "lg",
            className: "mt-6",
          })}
        >
          Try Again
        </a>
      )}
    </div>
  ) : (
    <form>
      <div className="grid w-full gap-1.5">
        <Label className="mt-6 text-lg" htmlFor="message">
          Your content
        </Label>
        <Textarea
          placeholder="Enter your text here"
          rows={10}
          defaultValue=""
          onChange={(evt) => setContent(evt.target.value)}
        />
      </div>
      <Button
        type="submit"
        size="lg"
        className="mt-6"
        onClick={() => {
          setLoading(true);
          setReady(true);
        }}
      >
        Submit
      </Button>
    </form>
  );
}
