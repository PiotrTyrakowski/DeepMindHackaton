import { formatRelativeTime, getLeads, MOCK_LEADS } from "@/lib/scraper-api";

import { recentLeadsData } from "./_components/crm.config";
import { InsightCards } from "./_components/insight-cards";
import { OperationalCards } from "./_components/operational-cards";
import { OverviewCards } from "./_components/overview-cards";
import { RecentLeadsTable } from "./_components/recent-leads-table/table";
import type { RecentLeadRow } from "./_components/recent-leads-table/schema";

const STATUS_MAP: Record<string, string> = {
  NEW: "New",
  RESEARCHED: "Contacted",
  WEBSITE_READY: "Proposal Sent",
  SMS_SENT: "Contacted",
  CALLED: "Contacted",
  BOGHT: "Qualified",
  NOT_INTERESTED: "Disqualified",
  CONVERTED: "Won",
};

export default async function Page() {
  const scraperLeads = await getLeads();
  const source = scraperLeads.length > 0 ? scraperLeads : MOCK_LEADS;

  const leads: RecentLeadRow[] = source.slice(0, 20).map((l) => ({
    id: `L-${l.id}`,
    name: l.name,
    company: l.city && l.state ? `${l.city}, ${l.state}` : l.location,
    status: STATUS_MAP[l.status] ?? l.status,
    source: l.category,
    lastActivity: formatRelativeTime(l.scraped_at),
  }));

  // Fallback to original mock data only if both API and MOCK_LEADS somehow produce nothing
  const tableData = leads.length > 0 ? leads : recentLeadsData;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <OverviewCards />
      <InsightCards />
      <OperationalCards />
      <RecentLeadsTable data={tableData} />
    </div>
  );
}
