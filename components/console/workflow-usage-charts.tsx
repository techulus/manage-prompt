"use client";

import { WorkflowRunStat } from "@/lib/utils/tinybird";
import { AreaChart } from "@tremor/react";

export function WorkflowUsageCharts({
  usageData,
}: {
  usageData: WorkflowRunStat[];
}) {
  const localisedData = usageData.map((data, idx) => {
    const date = new Date();
    date.setHours(date.getHours() - (23 - idx));
    const formattedHourString = date.toLocaleString("en-US", {
      hour: "numeric",
      hour12: true,
    });

    return {
      ...data,
      hour: formattedHourString,
    };
  });

  return (
    <div className="flex flex-col md:flex-row items-center justify-between pr-4">
      <AreaChart
        showAnimation
        className="h-64"
        data={localisedData}
        index="hour"
        categories={["total"]}
        colors={["blue"]}
        yAxisWidth={60}
        curveType="monotone"
        valueFormatter={(value: number) => `${value} runs`}
      />
      <AreaChart
        showAnimation
        className="h-64"
        data={localisedData}
        index="hour"
        categories={["tokens"]}
        colors={["yellow"]}
        yAxisWidth={60}
        curveType="monotone"
        valueFormatter={(value: number) => `${value} tokens`}
      />
    </div>
  );
}
