"use client";

import { Clock } from "lucide-react";
import { Funnel, FunnelChart, LabelList } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { actionItems, regionSalesData, salesPipelineChartConfig } from "./crm.config";

interface OperationalCardsProps {
  waitingForCall?: number;
  called?: number;
  bought?: number;
}

export function OperationalCards({ waitingForCall = 34, called = 28, bought = 20 }: OperationalCardsProps) {
  const total = waitingForCall + called + bought;

  const pipeline = [
    { stage: "Waiting for Call", value: waitingForCall, fill: "var(--chart-1)" },
    { stage: "Called", value: called, fill: "var(--chart-2)" },
    { stage: "Bought", value: bought, fill: "var(--chart-5)" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Lead Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="size-full">
          <ChartContainer config={salesPipelineChartConfig} className="size-full">
            <FunnelChart margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
              <Funnel className="stroke-2 stroke-card" dataKey="value" data={pipeline}>
                <LabelList className="fill-foreground stroke-0" dataKey="stage" position="right" offset={10} />
                <LabelList className="fill-foreground stroke-0" dataKey="value" position="left" offset={10} />
              </Funnel>
            </FunnelChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-xs">
            {total} total · {bought} converted ({Math.round((bought / total) * 100)}%)
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Leads by Category</CardTitle>
          <CardDescription className="font-medium tabular-nums">{total} total leads</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2.5">
            {regionSalesData.map((item) => (
              <div key={item.region} className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{item.region}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-semibold text-sm tabular-nums">{item.sales}</span>
                    <span className="font-medium text-green-500 text-xs tabular-nums">{item.growth}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={item.percentage} />
                  <span className="font-medium text-muted-foreground text-xs tabular-nums">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex justify-between gap-1 text-muted-foreground text-xs">
            <span>{regionSalesData.length} categories</span>
            <span>·</span>
            <span>Gallup NM · Tooele UT · Hobbs NM</span>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2.5">
            {actionItems.map((item) => (
              <li key={item.id} className="space-y-2 rounded-md border px-3 py-2">
                <div className="flex items-center gap-2">
                  <Checkbox defaultChecked={item.checked} />
                  <span className="font-medium text-sm">{item.title}</span>
                  <span
                    className={cn(
                      "w-fit rounded-md px-2 py-1 font-medium text-xs",
                      item.priority === "High" && "bg-destructive/20 text-destructive",
                      item.priority === "Medium" && "bg-yellow-500/20 text-yellow-500",
                      item.priority === "Low" && "bg-green-500/20 text-green-500",
                    )}
                  >
                    {item.priority}
                  </span>
                </div>
                <div className="font-medium text-muted-foreground text-xs">{item.desc}</div>
                <div className="flex items-center gap-1">
                  <Clock className="size-3 text-muted-foreground" />
                  <span className="font-medium text-muted-foreground text-xs">{item.due}</span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
