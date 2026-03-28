import { getLeads, MOCK_LEADS } from "@/lib/scraper-api";

import { RecentLeadsTable } from "../crm/_components/recent-leads-table/table";
import type { RecentLeadRow } from "../crm/_components/recent-leads-table/schema";
import { WaitingForCall } from "../leads/_components/waiting-for-call";
import { LeadSectionCards } from "./_components/section-cards";

const STATUS_MAP: Record<string, string> = {
  WAITING_FOR_CALL: "New",
  CALLED: "Contacted",
  BOUGHT: "Won",
};

export default async function Page() {
  const scraperLeads = await getLeads();
  const data = scraperLeads.length > 0 ? scraperLeads : MOCK_LEADS;

  const waitingForCall = data.filter((l) => l.status === "WAITING_FOR_CALL");
  const called = data.filter((l) => l.status === "CALLED").length;
  const bought = data.filter((l) => l.status === "BOUGHT").length;

  const recentLeads: RecentLeadRow[] = data.slice(0, 10).map((l) => ({
    id: `L-${l.id}`,
    name: l.name,
    company: l.city && l.state ? `${l.city}, ${l.state}` : l.location,
    status: STATUS_MAP[l.status] ?? l.status,
    source: l.category,
    lastActivity: new Date(l.scraped_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      <LeadSectionCards
        total={data.length}
        waitingForCall={waitingForCall.length}
        called={called}
        bought={bought}
      />
      <WaitingForCall leads={waitingForCall} />
      <RecentLeadsTable data={recentLeads} />
    </div>
  );
}
