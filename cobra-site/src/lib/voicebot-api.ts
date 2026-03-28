// Client-side voicebot API — uses NEXT_PUBLIC_ prefix so it's available in the browser
const VOICEBOT_API_URL =
  (typeof window !== "undefined"
    ? (window as Window & { __ENV__?: Record<string, string> }).__ENV__?.NEXT_PUBLIC_VOICEBOT_API_URL
    : process.env.NEXT_PUBLIC_VOICEBOT_API_URL) ?? "http://localhost:8001";

export interface CallRequest {
  phone_number: string;   // E.164 e.g. "+12025551234"
  business_name: string;
  business_type: string;
}

export interface CallResponse {
  conversation_id: string;
  call_sid: string;
}

export async function triggerCall(req: CallRequest): Promise<CallResponse> {
  const res = await fetch(`${VOICEBOT_API_URL}/call`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<CallResponse>;
}
