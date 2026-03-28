"use client";

import * as React from "react";

import { Loader2, Play, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SCRAPER_API = process.env.NEXT_PUBLIC_SCRAPER_API_URL ?? "http://localhost:8000";

export function ScrapeControls() {
  const [runAllLoading, setRunAllLoading] = React.useState(false);
  const [singleLoading, setSingleLoading] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [location, setLocation] = React.useState("");

  async function handleRunAll() {
    setRunAllLoading(true);
    try {
      const res = await fetch(`${SCRAPER_API}/scrape/run-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ max_results_per_target: 5 }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      toast.success("Scraping started", {
        description: `${data.jobs?.length ?? 0} jobs launched in the background.`,
      });
    } catch (e) {
      toast.error("Failed to start scraping", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setRunAllLoading(false);
    }
  }

  async function handleSingle(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || !location.trim()) return;
    setSingleLoading(true);
    try {
      const res = await fetch(`${SCRAPER_API}/scrape/single`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), location: location.trim(), max_results: 10 }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      toast.success("Scrape complete", {
        description: `Saved ${data.saved_to_db} new leads (${data.no_website_count} without website).`,
      });
    } catch (e) {
      toast.error("Scrape failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setSingleLoading(false);
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Run All */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="size-4 text-yellow-500" />
            Run All Targets
          </CardTitle>
          <CardDescription>
            Launch Apify scraping jobs for all 30 pre-configured targets (runs in background).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleRunAll} disabled={runAllLoading} className="w-full">
            {runAllLoading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
            {runAllLoading ? "Launching jobs…" : "Run All (30 targets)"}
          </Button>
        </CardContent>
      </Card>

      {/* Single scrape */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="size-4 text-blue-500" />
            Single Target
          </CardTitle>
          <CardDescription>
            Scrape a specific business type in a specific location (synchronous, ~1-2 min).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSingle} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <Label htmlFor="query">Business type</Label>
                <Input
                  id="query"
                  placeholder="e.g. plumber"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. Gallup, NM"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" disabled={singleLoading || !query.trim() || !location.trim()} variant="outline">
              {singleLoading ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
              {singleLoading ? "Scraping…" : "Scrape"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
