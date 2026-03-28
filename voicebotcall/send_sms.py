"""
Send an SMS with a link to a hardcoded number.
Usage: python send_sms.py
"""

import os
from dotenv import load_dotenv
from twilio.rest import Client

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

TO_NUMBER = "+48661878666"
LINK = "https://deep-mind-hackaton.vercel.app/"

client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

message = client.messages.create(
    body=f"{LINK}",
    from_=TWILIO_PHONE_NUMBER,
    to=TO_NUMBER,
)

print(f"Wysłano SMS, SID: {message.sid}")
