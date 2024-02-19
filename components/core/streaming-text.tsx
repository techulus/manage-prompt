"use client";

import { useCallback, useEffect, useState } from "react";
import { Spinner } from "./loaders";

export default function StreamingText({
  url,
  fallbackText,
}: {
  url: string;
  fallbackText: string;
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
  }, [url, fallbackText]);

  useEffect(() => {
    if (url) {
      getData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return loading ? <Spinner /> : <span>{result}</span>;
}