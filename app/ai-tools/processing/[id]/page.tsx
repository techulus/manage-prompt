"use client";

import { ContentBlock } from "@/components/core/content-block";
import { Spinner } from "@/components/core/loaders";
import { notifyError } from "@/components/core/toast";
import PageTitle from "@/components/layout/page-title";
import { CardContent } from "@/components/ui/card";
import { useCallback, useEffect } from "react";

export default function AIToolsResult({
  params: { id },
}: {
  params: {
    id: string;
  };
}) {
  const getStatus = useCallback(async (id: string) => {
    const response = await fetch(`/api/ai-tools/order/status?id=${id}`);
    const data = await response.json();

    if (data.status === "succeeded" && data.order_id) {
      window.location.href = `/ai-tools/order/${data.order_id}`;
    }
  }, []);

  useEffect(() => {
    if (!id) return;

    const interval = setInterval(() => {
      getStatus(id).catch(() => {
        notifyError("Something went wrong. Please try again later.");
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [id, getStatus]);

  return (
    <>
      <PageTitle title="Processing..." />

      <ContentBlock>
        <CardContent className="p-32">
          <Spinner />
        </CardContent>
      </ContentBlock>
    </>
  );
}
