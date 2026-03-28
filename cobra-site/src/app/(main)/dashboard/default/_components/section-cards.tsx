import { Phone, PhoneCall, PhoneIncoming, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface LeadSectionCardsProps {
  total: number;
  waitingForCall: number;
  called: number;
  bought: number;
}

export function LeadSectionCards({ total, waitingForCall, called, bought }: LeadSectionCardsProps) {
  const conversionRate = total > 0 ? Math.round((bought / total) * 100) : 0;
  const callRate = total > 0 ? Math.round(((called + bought) / total) * 100) : 0;

  return (
    <div className="grid @5xl/main:grid-cols-4 @xl/main:grid-cols-2 grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <Users className="size-3.5" /> Total Leads
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">{total}</CardTitle>
          <CardAction>
            <Badge variant="outline">no website</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Businesses scraped from Google Maps</div>
          <div className="text-muted-foreground">Home Services, Automotive, Beauty &amp; more</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <PhoneIncoming className="size-3.5" /> Waiting for Call
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">{waitingForCall}</CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-blue-300 text-blue-600">pending</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Ready to be called by the voicebot</div>
          <div className="text-muted-foreground">{Math.round((waitingForCall / total) * 100)}% of all leads</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <Phone className="size-3.5" /> Called
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">{called}</CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-orange-300 text-orange-600">{callRate}% rate</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Outbound calls initiated</div>
          <div className="text-muted-foreground">ElevenLabs AI voicebot calls</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription className="flex items-center gap-1.5">
            <PhoneCall className="size-3.5" /> Bought
          </CardDescription>
          <CardTitle className="font-semibold @[250px]/card:text-3xl text-2xl tabular-nums">{bought}</CardTitle>
          <CardAction>
            <Badge variant="outline" className="border-green-300 text-green-600">+{conversionRate}%</Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="font-medium">Converted — bought a website</div>
          <div className="text-muted-foreground">{conversionRate}% conversion rate</div>
        </CardFooter>
      </Card>
    </div>
  );
}
