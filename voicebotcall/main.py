"""
FastAPI server for triggering outbound calls via ElevenLabs Conversational AI.
"""

import asyncio
import os
import httpx
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from twilio.rest import Client as TwilioClient

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_AGENT_ID = os.getenv("ELEVENLABS_AGENT_ID")
ELEVENLABS_PHONE_NUMBER_ID = os.getenv("ELEVENLABS_PHONE_NUMBER_ID")

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

OUTBOUND_CALL_URL = "https://api.elevenlabs.io/v1/convai/twilio/outbound-call"
CONVERSATION_URL = "https://api.elevenlabs.io/v1/convai/conversations/{conversation_id}"

SMS_LINK = "https://deep-mind-hackaton.vercel.app/"

# conversation_id -> True if call ended
_ended_calls: dict[str, bool] = {}


def _elevenlabs_headers() -> dict:
    if not ELEVENLABS_API_KEY:
        raise HTTPException(status_code=500, detail="ELEVENLABS_API_KEY env var not set")
    return {"xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json"}


def _send_sms(to_number: str, body: str) -> None:
    client = TwilioClient(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    client.messages.create(
        body=body,
        from_=TWILIO_PHONE_NUMBER,
        to=to_number,
    )


async def _sms_if_call_alive(conversation_id: str, to_number: str, business_name: str) -> None:
    """Wait 5 seconds after call starts; if call hasn't ended yet, send SMS."""
    await asyncio.sleep(5)

    if _ended_calls.get(conversation_id):
        return

    # Double-check via ElevenLabs API
    try:
        url = CONVERSATION_URL.format(conversation_id=conversation_id)
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url, headers=_elevenlabs_headers())
        if resp.status_code == 200:
            status = resp.json().get("status", "")
            if status in ("done", "failed"):
                _ended_calls[conversation_id] = True
                return
    except Exception:
        pass

    first_name = business_name.split()[0] if business_name else "there"
    _send_sms(to_number, f"Hi {first_name}, here is your website: {SMS_LINK}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(title="VoiceBot Call Server", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class CallRequest(BaseModel):
    phone_number: str          # E.164 format, e.g. "+12025551234"
    business_name: str
    business_type: str


class CallResponse(BaseModel):
    conversation_id: str
    call_sid: str


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/call", response_model=CallResponse)
async def trigger_call(req: CallRequest):
    """
    Trigger an outbound call via ElevenLabs Conversational AI (Twilio).
    Returns the conversation_id and call SID immediately — the call is placed async.
    After 5 seconds, if the call is still active, sends an SMS with a link.
    """
    if not ELEVENLABS_AGENT_ID or not ELEVENLABS_PHONE_NUMBER_ID:
        raise HTTPException(
            status_code=500,
            detail="ELEVENLABS_AGENT_ID or ELEVENLABS_PHONE_NUMBER_ID env var not set",
        )

    temp_number = "+48661878666"
    payload = {
        "agent_id": ELEVENLABS_AGENT_ID,
        "agent_phone_number_id": ELEVENLABS_PHONE_NUMBER_ID,
        "to_number": temp_number,
        "conversation_initiation_client_data": {
            "dynamic_variables": {
                "business_name": req.business_name,
                "business_type": req.business_type,
            }
        },
    }

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(OUTBOUND_CALL_URL, headers=_elevenlabs_headers(), json=payload)

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    data = resp.json()
    conversation_id = data.get("conversation_id", "")
    call_sid = data.get("callSid", "")

    _ended_calls[conversation_id] = False
    temp_number = "+48661878666"
    asyncio.create_task(_sms_if_call_alive(conversation_id, temp_number, req.business_name))

    return CallResponse(conversation_id=conversation_id, call_sid=call_sid)


@app.post("/webhook/end-call")
async def end_call_webhook(request: Request):
    """
    Webhook called by ElevenLabs/Twilio when a call ends.
    Marks the conversation as ended so the SMS task won't fire.
    """
    body = await request.json()
    conversation_id = body.get("conversation_id") or body.get("ConversationSid") or body.get("CallSid", "")
    if conversation_id:
        _ended_calls[conversation_id] = True
    return {"ok": True}


@app.get("/call/{conversation_id}")
async def get_conversation(conversation_id: str):
    """
    Fetch the status and transcript of a conversation from ElevenLabs.
    Poll this endpoint to track call progress.
    """
    url = CONVERSATION_URL.format(conversation_id=conversation_id)

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(url, headers=_elevenlabs_headers())

    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    return resp.json()
