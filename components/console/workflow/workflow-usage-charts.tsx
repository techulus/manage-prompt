"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import type { WorkflowRunStat } from "@/lib/utils/analytics";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-3))",
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
      className="aspect-auto h-[320px] w-full"
    >
      <BarChart data={localisedData}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine tickMargin={10} axisLine />
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
      </BarChart>
    </ChartContainer>
  );
}
