import { CheckCircle2, Clock, XCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRelativeTime, getRuns } from "@/lib/scraper-api";

import { ScrapeControls } from "./_components/scrape-controls";

export default async function ScrapePage() {
  const runs = await getRuns();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-semibold text-2xl">Scrape Leads</h1>
        <p className="text-muted-foreground text-sm">
          Trigger Google Maps scraping to find local businesses without websites.
        </p>
      </div>

      <ScrapeControls />

      <Card>
        <CardHeader>
          <CardTitle>Scrape Run History</CardTitle>
          <CardDescription>
            {runs.length > 0
              ? `${runs.length} runs recorded`
              : "No runs yet — start your first scrape above."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {runs.length > 0 ? (
            <div className="overflow-hidden rounded-b-lg border-t">
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead>Query</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Leads saved</TableHead>
                    <TableHead>Started</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((run) => (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium capitalize">{run.query}</TableCell>
                      <TableCell className="text-muted-foreground">{run.location}</TableCell>
                      <TableCell>
                        <RunStatusBadge status={run.status} />
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {run.leads_saved > 0 ? (
                          <span className="font-medium text-green-600">+{run.leads_saved}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatRelativeTime(run.started_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center text-muted-foreground text-sm">
              No scrape history yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function RunStatusBadge({ status }: { status: string }) {
  if (status === "SUCCEEDED")
    return (
      <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
        <CheckCircle2 className="size-3" /> Succeeded
      </Badge>
    );
  if (status === "RUNNING")
    return (
      <Badge variant="secondary" className="gap-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
        <Clock className="size-3 animate-spin" /> Running
      </Badge>
    );
  return (
    <Badge variant="secondary" className="gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
      <XCircle className="size-3" /> {status}
    </Badge>
  );
}
