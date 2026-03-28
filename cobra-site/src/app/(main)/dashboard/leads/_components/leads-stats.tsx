import { Mail, Phone, PhoneCall, TrendingUp } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategorySummary, ScraperLead } from "@/lib/scraper-api";

interface LeadsStatsProps {
  leads: ScraperLead[];
  categories: CategorySummary[];
}

export function LeadsStats({ leads, categories }: LeadsStatsProps) {
  const total = leads.length;
  const waiting = leads.filter((l) => l.status === "WAITING_FOR_CALL").length;
  const called = leads.filter((l) => l.status === "CALLED").length;
  const interested = leads.filter((l) => l.status === "BOUGHT").length;
  const withPhone = leads.filter((l) => l.phone).length;

  return (
    <div className="grid grid-cols-2 gap-4 *:data-[slot=card]:shadow-xs lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm">Total Leads</CardTitle>
          <Phone className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="font-bold text-2xl tabular-nums">{total}</p>
          <p className="mt-1 text-muted-foreground text-xs">
            {withPhone} with phone number
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm">Waiting for Call</CardTitle>
          <div className="flex size-2 rounded-full bg-blue-500 animate-pulse" />
        </CardHeader>
        <CardContent>
          <p className="font-bold text-2xl tabular-nums">{waiting}</p>
          <p className="mt-1 text-muted-foreground text-xs">
            {total > 0 ? Math.round((waiting / total) * 100) : 0}% of all leads
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm">Called</CardTitle>
          <PhoneCall className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="font-bold text-2xl tabular-nums">{called}</p>
          <p className="mt-1 text-muted-foreground text-xs">
            {total > 0 ? Math.round((called / total) * 100) : 0}% of all leads
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm">Interested</CardTitle>
          <TrendingUp className="size-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <p className="font-bold text-2xl tabular-nums">{interested}</p>
          <p className="mt-1 text-muted-foreground text-xs">
            {total > 0 ? Math.round((interested / total) * 100) : 0}% conversion rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
