"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Phone, PhoneCall, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { triggerCall } from "@/lib/voicebot-api";

type Status = "idle" | "calling" | "done";

export function DemoForm() {
  const [businessName, setBusinessName] = React.useState("");
  const [businessType, setBusinessType] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [status, setStatus] = React.useState<Status>("idle");

  function isPhoneValid(value: string) {
    return /^[+\d][\d\s\-()]{6,}$/.test(value.trim());
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "idle") return;

    if (!businessName.trim() || !businessType.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    if (!isPhoneValid(phone)) {
      toast.error("Please enter a valid phone number", {
        description: "Format: +12025551234 or 2025551234",
      });
      return;
    }

    setStatus("calling");
    try {
      await triggerCall({
        phone_number: phone.trim(),
        business_name: businessName.trim(),
        business_type: businessType.trim(),
      });
      setStatus("done");
      toast.success("Bot is calling you!", {
        description: `Calling ${phone.trim()}`,
        duration: 5000,
      });
    } catch (err) {
      setStatus("idle");
      toast.error("Failed to initiate call", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  function handleReset() {
    setStatus("idle");
    setBusinessName("");
    setBusinessType("");
    setPhone("");
  }

  if (status === "done") {
    return (
      <Card className="w-full max-w-md border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
        <CardContent className="flex flex-col items-center gap-4 py-10">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
            <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-lg text-green-800 dark:text-green-300">
              The bot is calling you!
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              You will receive a call shortly on{" "}
              <span className="font-medium text-foreground">{phone}</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleReset} className="mt-2 gap-2">
            <RotateCcw className="size-4" />
            Try again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
            <Phone className="size-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <CardTitle className="text-lg">Get a call for your business website</CardTitle>
            <CardDescription className="text-sm">
              Enter your details and our AI will call you in seconds
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="businessName">Business name</Label>
            <Input
              id="businessName"
              placeholder="Smith's Plumbing"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={status === "calling"}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="businessType">Business type</Label>
            <Input
              id="businessType"
              placeholder="plumber"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              disabled={status === "calling"}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 202 555 1234"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={status === "calling"}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={status === "calling"}
            className="mt-1 h-11 gap-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {status === "calling" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <PhoneCall className="size-4" />
                Call me now
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
