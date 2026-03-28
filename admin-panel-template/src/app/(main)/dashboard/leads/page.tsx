import { getCategoriesSummary, getLeads, MOCK_LEADS } from "@/lib/scraper-api";

import { LeadsStats } from "./_components/leads-stats";
import { ScraperLeadsTable } from "./_components/leads-table/table";

export default async function LeadsPage() {
  const [leads, categories] = await Promise.all([getLeads(), getCategoriesSummary()]);

  // Fall back to mock data when the scraper API is not running
  const data = leads.length > 0 ? leads : MOCK_LEADS;

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="font-semibold text-2xl">Leads</h1>
        <p className="text-muted-foreground text-sm">
          Local businesses scraped from Google Maps — no website detected.
          {leads.length === 0 && (
            <span className="ml-1 text-yellow-600 dark:text-yellow-400">
              (Scraper API offline — showing mock data)
            </span>
          )}
        </p>
      </div>
      <LeadsStats leads={data} categories={categories} />
      <ScraperLeadsTable data={data} />
    </div>
  );
}
