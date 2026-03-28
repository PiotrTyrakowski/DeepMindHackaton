import { Mail, Phone, TrendingUp, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategorySummary, ScraperLead } from "@/lib/scraper-api";

interface LeadsStatsProps {
  leads: ScraperLead[];
  categories: CategorySummary[];
}

export function LeadsStats({ leads, categories }: LeadsStatsProps) {
  const total = leads.length;
  const withPhone = leads.filter((l) => l.phone).length;
  const withEmail = leads.filter((l) => l.email).length;
  const converted = leads.filter((l) => l.status === "CONVERTED").length;

  return (
    <div className="grid grid-cols-2 gap-4 *:data-[slot=card]:shadow-xs lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm">Total Leads</CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="font-bold text-2xl tabular-nums">{total}</p>
          <p className="mt-1 text-muted-foreground text-xs">Businesses without a website</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm">With Phone</CardTitle>
          <Phone className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="font-bold text-2xl tabular-nums">{withPhone}</p>
          <p className="mt-1 text-muted-foreground text-xs">
            {total > 0 ? Math.round((withPhone / total) * 100) : 0}% of all leads
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm">With Email</CardTitle>
          <Mail className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="font-bold text-2xl tabular-nums">{withEmail}</p>
          <p className="mt-1 text-muted-foreground text-xs">
            {total > 0 ? Math.round((withEmail / total) * 100) : 0}% of all leads
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="font-medium text-sm">Converted</CardTitle>
          <TrendingUp className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="font-bold text-2xl tabular-nums">{converted}</p>
          <p className="mt-1 text-muted-foreground text-xs">
            {total > 0 ? Math.round((converted / total) * 100) : 0}% conversion rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
