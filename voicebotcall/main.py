"""
FastAPI server for triggering outbound calls via ElevenLabs Conversational AI.
"""

import os
import httpx
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_AGENT_ID = os.getenv("ELEVENLABS_AGENT_ID")
ELEVENLABS_PHONE_NUMBER_ID = os.getenv("ELEVENLABS_PHONE_NUMBER_ID")

OUTBOUND_CALL_URL = "https://api.elevenlabs.io/v1/convai/twilio/outbound-call"
CONVERSATION_URL = "https://api.elevenlabs.io/v1/convai/conversations/{conversation_id}"


def _elevenlabs_headers() -> dict:
    if not ELEVENLABS_API_KEY:
        raise HTTPException(status_code=500, detail="ELEVENLABS_API_KEY env var not set")
    return {"xi-api-key": ELEVENLABS_API_KEY, "Content-Type": "application/json"}


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
    """
    if not ELEVENLABS_AGENT_ID or not ELEVENLABS_PHONE_NUMBER_ID:
        raise HTTPException(
            status_code=500,
            detail="ELEVENLABS_AGENT_ID or ELEVENLABS_PHONE_NUMBER_ID env var not set",
        )

    payload = {
        "agent_id": ELEVENLABS_AGENT_ID,
        "agent_phone_number_id": ELEVENLABS_PHONE_NUMBER_ID,
        "to_number": req.phone_number,
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
    return CallResponse(
        conversation_id=data.get("conversation_id", ""),
        call_sid=data.get("callSid", ""),
    )


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
