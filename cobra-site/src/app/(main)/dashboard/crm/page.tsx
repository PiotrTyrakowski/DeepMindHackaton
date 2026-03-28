import { formatRelativeTime, getCategoriesSummary, getLeads, MOCK_LEADS } from "@/lib/scraper-api";

import { InsightCards } from "./_components/insight-cards";
import { OperationalCards } from "./_components/operational-cards";
import { OverviewCards } from "./_components/overview-cards";
import { RecentLeadsTable } from "./_components/recent-leads-table/table";
import type { RecentLeadRow } from "./_components/recent-leads-table/schema";

const STATUS_MAP: Record<string, string> = {
  WAITING_FOR_CALL: "New",
  CALLED: "Contacted",
  BOUGHT: "Won",
};

export default async function Page() {
  const [scraperLeads, categories] = await Promise.all([getLeads(), getCategoriesSummary()]);
  const source = scraperLeads.length > 0 ? scraperLeads : MOCK_LEADS;

  const waitingForCall = source.filter((l) => l.status === "WAITING_FOR_CALL").length;
  const called = source.filter((l) => l.status === "CALLED").length;
  const bought = source.filter((l) => l.status === "BOUGHT").length;
  const total = source.length;
  const withRating = source.filter((l) => l.rating != null);
  const avgRating =
    withRating.length > 0
      ? withRating.reduce((s, l) => s + (l.rating ?? 0), 0) / withRating.length
      : 0;

  const tableData: RecentLeadRow[] = source.slice(0, 20).map((l) => ({
    id: `L-${l.id}`,
    name: l.name,
    company: l.city && l.state ? `${l.city}, ${l.state}` : l.location,
    status: STATUS_MAP[l.status] ?? l.status,
    source: l.category,
    lastActivity: formatRelativeTime(l.scraped_at),
  }));

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <OverviewCards totalLeads={total} callsInitiated={called + bought} avgRating={avgRating} bought={bought} />
      <InsightCards categoryCounts={categories} />
      <OperationalCards waitingForCall={waitingForCall} called={called} bought={bought} />
      <RecentLeadsTable data={tableData} />
    </div>
  );
}
