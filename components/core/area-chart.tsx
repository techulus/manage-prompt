"use client";

import { ChartConfig, ChartContainer } from "@/components/ui/chart";
import { WorkflowRunStat } from "@/lib/utils/tinybird";
import { Bar, BarChart } from "recharts";

export function WorkflowStatsAreaChart({
  chartData,
}: {
  chartData: WorkflowRunStat[];
}) {
  const chartConfig = {
    desktop: {
      label: "Total",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig;

  return (
    <div className="hidden lg:block max-w-[400px] w-full">
      <ChartContainer config={chartConfig} className="h-[80px]">
        <BarChart accessibilityLayer data={chartData}>
          <Bar dataKey="total" fill="var(--color-desktop)" radius={8} />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
