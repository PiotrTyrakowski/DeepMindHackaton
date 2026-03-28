"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Phone, PhoneCall, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { triggerCall } from "@/lib/voicebot-api";

type Status = "idle" | "calling" | "done";

export default function DemoStandalonePage() {
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

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/25">
            <Phone className="size-7 text-white" />
          </div>
          <h1 className="mt-2 font-semibold text-2xl tracking-tight">
            Get a call for your business website
          </h1>
          <p className="max-w-xs text-balance text-muted-foreground text-sm">
            Enter your details and our AI agent will call you in seconds to discuss your website.
          </p>
        </div>

        {status === "done" ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 shadow-sm">
            <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="size-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-lg">The bot is calling you!</p>
              <p className="mt-1 text-muted-foreground text-sm">
                You will receive a call shortly on{" "}
                <span className="font-medium text-foreground">{phone}</span>
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset} className="mt-1 gap-2">
              <RotateCcw className="size-4" />
              Try again
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm"
          >
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
        )}

        <p className="mt-6 text-center text-muted-foreground text-xs">
          Your information is only used to place this demo call.
        </p>
      </div>
    </div>
  );
}
