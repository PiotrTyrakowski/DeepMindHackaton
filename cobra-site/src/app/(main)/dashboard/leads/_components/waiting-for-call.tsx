"use client";

import { Facebook, MapPin, Phone, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { ScraperLead } from "@/lib/scraper-api";

import { CallButton } from "./call-button";

interface WaitingForCallProps {
  leads: ScraperLead[];
}

export function WaitingForCall({ leads }: WaitingForCallProps) {
  if (leads.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <div className="flex size-2 rounded-full bg-blue-500 animate-pulse" />
        <h2 className="font-semibold text-base">Waiting for Call</h2>
        <Badge variant="secondary" className="tabular-nums">{leads.length}</Badge>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {leads.map((lead) => (
          <Card key={lead.id} className="group relative overflow-hidden border-l-4 border-l-blue-500 shadow-xs transition-shadow hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-sm leading-tight">{lead.name}</p>
                  <p className="mt-0.5 text-muted-foreground text-xs">{lead.category}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {(lead.city || lead.state) && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3 shrink-0" />
                        {lead.city && lead.state ? `${lead.city}, ${lead.state}` : lead.location}
                      </span>
                    )}
                    {lead.rating != null && (
                      <span className="flex items-center gap-1">
                        <Star className="size-3 shrink-0 fill-yellow-400 text-yellow-400" />
                        {lead.rating.toFixed(1)}
                        {lead.reviews_count != null && <span>({lead.reviews_count})</span>}
                      </span>
                    )}
                    {lead.facebook && (
                      <a
                        href={lead.facebook.startsWith("http") ? lead.facebook : `https://${lead.facebook}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        <Facebook className="size-3 shrink-0" />
                        Facebook
                      </a>
                    )}
                  </div>
                  {lead.phone && (
                    <p className="mt-2 flex items-center gap-1 font-mono text-xs">
                      <Phone className="size-3 text-muted-foreground" />
                      {lead.phone}
                    </p>
                  )}
                </div>
                <div className="shrink-0 pt-0.5">
                  {lead.phone ? (
                    <CallButton
                      phone={lead.phone}
                      businessName={lead.name}
                      businessType={lead.category}
                      variant="full"
                    />
                  ) : (
                    <span className="text-muted-foreground text-xs">No phone</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
