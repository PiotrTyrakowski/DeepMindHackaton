#!/usr/bin/env python3
# /// script
# requires-python = ">=3.8"
# dependencies = [
#     "requests>=2.32.3",
#     "python-dotenv>=1.0.1",
#     "websockets>=12.0",
# ]
# ///
"""
Simple script to trigger outbound calls via ElevenLabs Conversational AI.
Usage: python trigger_call.py +1234567890 "Business Name" "Business Type"
"""

import sys
import requests
import json
import time
import asyncio
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
import os

try:
    import websockets
    WEBSOCKETS_AVAILABLE = True
except ImportError:
    WEBSOCKETS_AVAILABLE = False

# Load environment variables
load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_AGENT_ID = os.getenv("ELEVENLABS_AGENT_ID")
ELEVENLABS_PHONE_NUMBER_ID = os.getenv("ELEVENLABS_PHONE_NUMBER_ID")

# API endpoint for triggering outbound calls via Twilio
API_URL = "https://api.elevenlabs.io/v1/convai/twilio/outbound-call"


def trigger_call(phone_number: str, business_name: str, business_type: str):
    """Trigger an outbound call via ElevenLabs."""

    if not ELEVENLABS_API_KEY or not ELEVENLABS_AGENT_ID or not ELEVENLABS_PHONE_NUMBER_ID:
        print("❌ Error: Missing required credentials in .env file")
        print("   Required: ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID, ELEVENLABS_PHONE_NUMBER_ID")
        sys.exit(1)

    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "agent_id": ELEVENLABS_AGENT_ID,
        "agent_phone_number_id": ELEVENLABS_PHONE_NUMBER_ID,
        "to_number": phone_number,
        "conversation_initiation_client_data": {
            "dynamic_variables": {
                "business_name": business_name,
                "business_type": business_type
            }
        }
    }

    print(f"\n📞 Initiating call...")
    print(f"   Phone: {phone_number}")
    print(f"   Business: {business_name} ({business_type})")
    print(f"   Agent ID: {ELEVENLABS_AGENT_ID}")

    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()

        result = response.json()
        conversation_id = result.get("conversation_id", "unknown")
        call_sid = result.get("callSid", "unknown")

        print(f"\n✅ Call triggered successfully!")
        print(f"   Conversation ID: {conversation_id}")
        print(f"   Call SID: {call_sid}")

        # Try real-time monitoring first (requires Enterprise)
        if WEBSOCKETS_AVAILABLE:
            success = asyncio.run(
                monitor_via_websocket(conversation_id, phone_number, business_name, business_type)
            )
            # If WebSocket failed, fall back to polling
            if not success:
                stream_conversation(conversation_id, phone_number, business_name, business_type)
        else:
            print("\n⚠️  Install websockets for real-time monitoring: uv pip install websockets")
            stream_conversation(conversation_id, phone_number, business_name, business_type)

        return result

    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error triggering call: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"   Response: {e.response.text}")
        sys.exit(1)


def get_conversation_details(conversation_id: str) -> dict:
    """Fetch conversation details including transcript."""

    url = f"https://api.elevenlabs.io/v1/convai/conversations/{conversation_id}"
    headers = {"xi-api-key": ELEVENLABS_API_KEY}

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"⚠️  Error fetching conversation: {e}")
        return None


def print_message(role: str, message: str, time_in_call: int = None):
    """Print a conversation message with nice formatting."""

    timestamp = f"[{time_in_call}s]" if time_in_call is not None else ""

    if role == "agent":
        print(f"\n🤖 Agent {timestamp}: {message}")
    else:
        print(f"\n👤 User {timestamp}: {message}")


async def monitor_via_websocket(conversation_id: str, phone_number: str, business_name: str, business_type: str):
    """Monitor conversation in real-time via WebSocket (Enterprise feature)."""

    uri = f"wss://api.elevenlabs.io/v1/convai/conversations/{conversation_id}/monitor"
    headers = {"xi-api-key": ELEVENLABS_API_KEY}

    print("\n" + "="*60)
    print("📞 LIVE CALL MONITORING (Real-time WebSocket)")
    print("="*60)
    print(f"Press Ctrl+C to stop monitoring (call will continue)\n")

    try:
        async with websockets.connect(uri, additional_headers=headers) as websocket:
            print("✅ Connected to real-time monitoring\n")

            async for message in websocket:
                try:
                    data = json.loads(message)
                    event_type = data.get("type")

                    if event_type == "user_transcript":
                        # User spoke
                        text = data.get("user_transcript", {}).get("transcript", "")
                        if text:
                            print(f"\n👤 User: {text}")

                    elif event_type == "agent_response":
                        # Agent responded
                        text = data.get("agent_response", "")
                        if text:
                            print(f"\n🤖 Agent: {text}")

                    elif event_type == "conversation_initiation_metadata":
                        print(f"🔵 Call connected\n")

                    elif event_type == "interruption":
                        print(f"\n⚡ [User interrupted]")

                except json.JSONDecodeError:
                    continue

    except websockets.exceptions.WebSocketException as e:
        error_msg = str(e)
        if "403" in error_msg or "Forbidden" in error_msg:
            print("❌ Real-time monitoring requires Enterprise plan")
            print("   Falling back to post-call transcript...\n")
            return False
        elif "401" in error_msg or "Unauthorized" in error_msg:
            print("❌ Authentication failed - check your API key has 'ElevenLabs Agents Write' scope")
            print("   Falling back to post-call transcript...\n")
            return False
        else:
            print(f"❌ WebSocket error: {error_msg}")
            print("   Falling back to post-call transcript...\n")
            return False
    except Exception as e:
        print(f"❌ Connection error: {e}")
        print("   Falling back to post-call transcript...\n")
        return False

    # Save final transcript
    details = get_conversation_details(conversation_id)
    if details:
        log_call(phone_number, business_name, business_type, conversation_id, details)

    return True


def stream_conversation(conversation_id: str, phone_number: str, business_name: str, business_type: str):
    """Stream conversation messages live by polling the API."""

    print("\n" + "="*60)
    print("📞 LIVE CALL MONITORING")
    print("="*60)
    print(f"Press Ctrl+C to stop monitoring (call will continue)\n")

    printed_message_count = 0
    call_active = True
    poll_count = 0

    try:
        while call_active:
            details = get_conversation_details(conversation_id)
            poll_count += 1

            if not details:
                time.sleep(2)
                continue

            status = details.get("status", "unknown")
            transcript = details.get("transcript", [])

            # Debug output
            print(f"\r[Poll #{poll_count}] Status: {status} | Messages: {len(transcript)}", end="", flush=True)

            # Print any new messages
            if len(transcript) > printed_message_count:
                print()  # New line after status line
                for message_data in transcript[printed_message_count:]:
                    role = message_data.get("role", "unknown")
                    message = message_data.get("message", "")
                    time_in_call = message_data.get("time_in_call_secs")

                    # Debug: print raw message data if message is empty
                    if not message:
                        print(f"\n[DEBUG] Message data: {json.dumps(message_data, indent=2)}")
                    else:
                        print_message(role, message, time_in_call)

                printed_message_count = len(transcript)

            # Check if call has ended
            if status in ["done", "failed"]:
                call_active = False
                print(f"\n{'='*60}")
                print(f"✅ Call ended - Status: {status}")
                print(f"{'='*60}\n")

            # Wait before next poll
            if call_active:
                time.sleep(2)  # Poll every 2 seconds

        # Save final transcript to log
        log_call(phone_number, business_name, business_type, conversation_id, details)

    except KeyboardInterrupt:
        print(f"\n\n{'='*60}")
        print("⏸️  Monitoring stopped (call is still active)")
        print(f"{'='*60}\n")

        # Still save what we have so far
        if details:
            log_call(phone_number, business_name, business_type, conversation_id, details)


def log_call(phone_number: str, business_name: str, business_type: str, conversation_id: str, response_data: dict):
    """Log call details to a JSON file."""

    log_dir = Path("call_logs")
    log_dir.mkdir(exist_ok=True)

    log_file = log_dir / f"{conversation_id}.json"

    log_data = {
        "conversation_id": conversation_id,
        "phone_number": phone_number,
        "business_name": business_name,
        "business_type": business_type,
        "timestamp": datetime.now().isoformat(),
        "response": response_data
    }

    with open(log_file, 'w') as f:
        json.dump(log_data, f, indent=2)

    print(f"   Log saved: {log_file}")


def main():
    """Main entry point."""

    if len(sys.argv) != 4:
        print("Usage: python trigger_call.py <phone_number> <business_name> <business_type>")
        print("\nExample:")
        print('  python trigger_call.py "+1234567890" "Joe\'s Pizza" "Restaurant"')
        sys.exit(1)

    phone_number = sys.argv[1]
    business_name = sys.argv[2]
    business_type = sys.argv[3]

    # Validate phone number format
    if not phone_number.startswith("+"):
        print("⚠️  Warning: Phone number should start with + and country code (e.g., +1234567890)")

    trigger_call(phone_number, business_name, business_type)


if _name_ == "_main_":
    main()