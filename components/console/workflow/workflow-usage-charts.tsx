"use client";

import type { WorkflowRunStat } from "@/lib/utils/analytics";
import { Bar, BarChart, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

export function WorkflowUsageCharts({
  usageData,
}: {
  usageData: WorkflowRunStat[];
}) {
  const localisedData = usageData.map((data) => {
    return {
      ...data,
      date: new Date(data.date).toDateString(),
    };
  });

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[180px] w-full"
    >
      <BarChart data={localisedData}>
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar
          dataKey="tokens"
          type="natural"
          fill="var(--color-desktop)"
          stroke="var(--color-tokens)"
          stackId="a"
        />
        <ChartLegend content={<ChartLegendContent />} />
      </BarChart>
    </ChartContainer>
  );
}
