"use client";

import { format, subWeeks } from "date-fns";
import { PhoneCall, Star } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, Line, LineChart, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import {
  leadsChartConfig,
  leadsChartData,
  proposalsChartConfig,
  proposalsChartData,
  revenueChartConfig,
  revenueChartData,
} from "./crm.config";

interface OverviewCardsProps {
  totalLeads?: number;
  callsInitiated?: number;
  avgRating?: number;
  bought?: number;
}

export function OverviewCards({
  totalLeads = 82,
  callsInitiated = 48,
  avgRating = 4.6,
  bought = 20,
}: OverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:shadow-xs sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card>
        <CardHeader>
          <CardTitle>Leads Scraped</CardTitle>
          <CardDescription>All time</CardDescription>
        </CardHeader>
        <CardContent className="size-full">
          <ChartContainer className="size-full min-h-24" config={leadsChartConfig}>
            <BarChart accessibilityLayer data={leadsChartData} barSize={8}>
              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                background={{ fill: "var(--color-background)", radius: 4, opacity: 0.07 }}
                dataKey="newLeads"
                stackId="a"
                fill="var(--color-newLeads)"
                radius={[0, 0, 0, 0]}
              />
              <Bar dataKey="called" stackId="a" fill="var(--color-called)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex items-center justify-between">
          <span className="font-semibold text-xl tabular-nums">{totalLeads}</span>
          <span className="font-medium text-green-500 text-sm">all without website</span>
        </CardFooter>
      </Card>

      <Card className="overflow-hidden pb-0">
        <CardHeader>
          <CardTitle>Calls Initiated</CardTitle>
          <CardDescription>All time</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <ChartContainer className="size-full min-h-24" config={proposalsChartConfig}>
            <AreaChart data={proposalsChartData} margin={{ left: 0, right: 0, top: 5 }}>
              <XAxis dataKey="date" tickLine={false} tickMargin={10} axisLine={false} hide />
              <ChartTooltip content={<ChartTooltipContent hideIndicator />} />
              <Area
                dataKey="callsSent"
                fill="var(--color-callsSent)"
                fillOpacity={0.05}
                stroke="var(--color-callsSent)"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="w-fit rounded-lg bg-yellow-500/10 p-2">
            <Star className="size-5 text-yellow-500" />
          </div>
        </CardHeader>
        <CardContent className="flex size-full flex-col justify-between">
          <div className="space-y-1.5">
            <CardTitle>Avg. Google Rating</CardTitle>
            <CardDescription>Across all leads</CardDescription>
          </div>
          <p className="font-medium text-2xl tabular-nums">⭐ {avgRating.toFixed(1)}</p>
          <div className="w-fit rounded-md bg-yellow-500/10 px-2 py-1 font-medium text-yellow-600 text-xs">
            78 / {totalLeads} rated
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="w-fit rounded-lg bg-green-500/10 p-2">
            <PhoneCall className="size-5 text-green-500" />
          </div>
        </CardHeader>
        <CardContent className="flex size-full flex-col justify-between">
          <div className="space-y-1.5">
            <CardTitle>Bought</CardTitle>
            <CardDescription>Converted leads</CardDescription>
          </div>
          <p className="font-medium text-2xl tabular-nums">{bought}</p>
          <div className="w-fit rounded-md bg-green-500/10 px-2 py-1 font-medium text-green-500 text-xs">
            {totalLeads > 0 ? Math.round((bought / totalLeads) * 100) : 0}% conversion rate
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-1 xl:col-span-2">
        <CardHeader>
          <CardTitle>Leads Growth</CardTitle>
          <CardDescription>Cumulative acquisition</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueChartConfig} className="h-24 w-full">
            <LineChart data={revenueChartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                strokeWidth={2}
                dataKey="revenue"
                stroke="var(--color-revenue)"
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-sm">82 leads scraped in March 2026</p>
        </CardFooter>
      </Card>
    </div>
  );
}
