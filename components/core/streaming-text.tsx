"use client";

import { useCallback, useEffect, useState } from "react";
import Markdown from "react-markdown";
import { Spinner } from "./loaders";

export default function StreamingText({
  url,
  body,
  fallbackText,
  className,
  renderMarkdown = false,
  onCompleted,
}: {
  url: string;
  body?: any;
  fallbackText: string;
  className?: string;
  renderMarkdown?: boolean;
  onCompleted?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const getData = useCallback(async () => {
    setLoading(true);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (!response.ok) {
      return null;
    }

    const data = response.body;
    if (!data) {
      setResult(fallbackText);
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    setLoading(false);

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setResult((prev) => (prev ?? "") + chunkValue);
    }

    onCompleted?.();
  }, [url, fallbackText, body, onCompleted]);

  useEffect(() => {
    if (url) {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return loading ? (
    <Spinner className={className} />
  ) : renderMarkdown ? (
    <Markdown className="prose dark:prose-invert prose-a:text-primary">
      {result}
    </Markdown>
  ) : (
    <p className={className}>{result}</p>
  );
}
