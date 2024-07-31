"use client";

import { ContentBlock } from "@/components/core/content-block";
import { Spinner } from "@/components/core/loaders";
import { notifyError } from "@/components/core/toast";
import { CardContent } from "@/components/ui/card";
import { useCallback, useEffect, useState } from "react";

export default function AIToolsResult({
  params: { id },
}: {
  params: {
    id: string;
  };
}) {
  const [status, setStatus] = useState<string>("starting");

  const getStatus = useCallback(async (id: string) => {
    const response = await fetch(`/api/ai-tools/order/status?id=${id}`);
    const data = await response.json();
    if (data.status) {
      setStatus(data.status);
    }
    if (data.status === "succeeded" && data.order_id) {
      window.location.href = `/ai-tools/order/${data.order_id}`;
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    let intervalId: NodeJS.Timer;

    intervalId = setInterval(() => {
      getStatus(id).catch(() => {
        notifyError("Something went wrong. Please try again later.");
        if (intervalId) clearInterval(intervalId);
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, [id, getStatus]);

  return (
    <>
      <div className="hidden md:block h-8"></div>
      <ContentBlock>
        <CardContent className="p-32">
          <Spinner />

          <p className="text-center font-bold mt-4">Processing your image</p>
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            This may take a few seconds.
          </p>
          <p className="mt-4 text-center text-gray-500 dark:text-gray-400 text-sm capitalize">
            {status}
          </p>
        </CardContent>
      </ContentBlock>
    </>
  );
}
