"use client";

import * as React from "react";

import { Loader2, Phone, PhoneCall } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { triggerCall } from "@/lib/voicebot-api";

interface CallButtonProps {
  phone: string;
  businessName: string;
  businessType: string;
  variant?: "icon" | "full";
}

export function CallButton({ phone, businessName, businessType, variant = "icon" }: CallButtonProps) {
  const [status, setStatus] = React.useState<"idle" | "calling" | "done">("idle");

  async function handleCall() {
    if (status !== "idle") return;
    setStatus("calling");
    try {
      await triggerCall({ phone_number: phone, business_name: businessName, business_type: businessType });
      setStatus("done");
      toast.success(`Call initiated to ${businessName}`, {
        description: phone,
        duration: 4000,
      });
    } catch (err) {
      setStatus("idle");
      toast.error("Call failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  if (variant === "full") {
    return (
      <Button
        size="sm"
        onClick={handleCall}
        disabled={status !== "idle"}
        className={
          status === "done"
            ? "bg-green-600 hover:bg-green-600 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }
      >
        {status === "calling" ? (
          <Loader2 className="size-4 animate-spin" />
        ) : status === "done" ? (
          <PhoneCall className="size-4" />
        ) : (
          <Phone className="size-4" />
        )}
        {status === "calling" ? "Calling…" : status === "done" ? "Called" : "Call Now"}
      </Button>
    );
  }

  return (
    <Button
      variant={status === "done" ? "default" : "outline"}
      size="icon"
      className={`size-8 ${status === "done" ? "bg-green-600 hover:bg-green-600 border-green-600 text-white" : "text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-400"}`}
      onClick={handleCall}
      disabled={status !== "idle"}
      title={`Call ${businessName}`}
    >
      {status === "calling" ? (
        <Loader2 className="size-4 animate-spin" />
      ) : status === "done" ? (
        <PhoneCall className="size-4" />
      ) : (
        <Phone className="size-4" />
      )}
    </Button>
  );
}
