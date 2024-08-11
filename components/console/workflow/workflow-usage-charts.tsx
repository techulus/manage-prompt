"use client";

import { WorkflowRunStat } from "@/lib/utils/tinybird";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "../../ui/chart";

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
    <ChartContainer
      config={{
        tokens: {
          label: "Tokens",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="aspect-auto h-[280px] w-full"
    >
      <AreaChart data={localisedData}>
        <defs>
          <linearGradient id="fillTokens" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-tokens)"
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor="var(--color-tokens)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="hour"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Area
          dataKey="tokens"
          type="natural"
          fill="url(#fillTokens)"
          stroke="var(--color-tokens)"
          stackId="a"
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}
