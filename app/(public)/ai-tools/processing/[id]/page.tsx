"use client";

import { Spinner } from "@/components/core/loaders";
import PageSection from "@/components/core/page-section";
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

    const intervalId = setInterval(() => {
      getStatus(id).catch(() => {
        notifyError("Something went wrong. Please try again later.");
        if (intervalId) clearInterval(intervalId);
      });
    }, 2500);

    return () => clearInterval(intervalId);
  }, [id, getStatus]);

  return (
    <PageSection>
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
    </PageSection>
  );
}
