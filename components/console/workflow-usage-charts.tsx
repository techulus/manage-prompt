"use client";

import { AreaChart } from "@tremor/react";

export function WorkflowUsageCharts({ usageData }: { usageData: any }) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between pr-4">
      <AreaChart
        showAnimation
        className="h-64"
        data={usageData}
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
        data={usageData}
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
