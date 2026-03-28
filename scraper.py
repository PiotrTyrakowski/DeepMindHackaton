"""
Apify Google Maps scraper — shows only businesses WITHOUT a website.
Usage:
  uv run scraper.py                     → roofing Gallup NM (default)
  uv run scraper.py "plumber Austin TX" → custom keyword
"""

import os
import sys
import time

import requests
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("APIFY_API_TOKEN", "")
ACTOR_ID = "enckay~google-maps-places-extractor"
BASE = "https://api.apify.com/v2"

KEYWORD = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "roofing Gallup NM"


# ── Apify helpers ──────────────────────────────────────────────────────────────

def start_run(keyword: str) -> tuple[str, str]:
    """POST /runs → (runId, datasetId)"""
    resp = requests.post(
        f"{BASE}/acts/{ACTOR_ID}/runs",
        params={"token": TOKEN},
        json={"keyword": keyword},
        timeout=30,
    )
    if not resp.ok:
        print(f"Apify error {resp.status_code}: {resp.text[:500]}")
        sys.exit(1)
    data = resp.json()["data"]
    return data["id"], data["defaultDatasetId"]


def wait_for_run(run_id: str) -> str:
    """Poll GET /actor-runs/{id} until finished → returns status string."""
    url = f"{BASE}/actor-runs/{run_id}"
    print("  Waiting", end="", flush=True)
    while True:
        resp = requests.get(url, params={"token": TOKEN}, timeout=15)
        resp.raise_for_status()
        status = resp.json()["data"]["status"]
        if status in ("SUCCEEDED", "FAILED", "ABORTED", "TIMED-OUT"):
            print(f" {status}")
            return status
        print(".", end="", flush=True)
        time.sleep(5)


def get_dataset_items(dataset_id: str) -> list[dict]:
    """GET /datasets/{id}/items → list of raw place objects."""
    resp = requests.get(
        f"{BASE}/datasets/{dataset_id}/items",
        params={"token": TOKEN, "clean": "true"},
        timeout=30,
    )
    resp.raise_for_status()
    return resp.json()


# ── Display ────────────────────────────────────────────────────────────────────

def print_leads(leads: list[dict], total: int) -> None:
    print(f"\n{'─'*60}")
    print(f"  {len(leads)} without website  (of {total} total scraped)")
    print(f"{'─'*60}")

    for i, b in enumerate(leads, 1):
        name    = b.get("businessName") or "—"
        cat     = b.get("category") or ""
        addr    = b.get("address") or ""
        phone   = b.get("phone") or ""
        rating  = b.get("rating")
        reviews = b.get("reviewCount")
        maps    = b.get("googleMapsUrl") or ""

        print(f"\n  {i:>2}. {name}")
        if cat:    print(f"      Category : {cat.split(',')[0].strip()}")
        if addr:   print(f"      Address  : {addr}")
        if phone:  print(f"      Phone    : {phone}")
        if rating: print(f"      Rating   : {rating}⭐  ({reviews or 0} reviews)")
        if maps:   print(f"      Maps     : {maps}")

    print(f"\n{'─'*60}\n")


# ── Main ───────────────────────────────────────────────────────────────────────

def main():
    if not TOKEN:
        print("ERROR: APIFY_API_TOKEN not set in .env")
        sys.exit(1)

    print(f"\nKeyword: «{KEYWORD}»")
    print("Starting Apify run...")

    run_id, dataset_id = start_run(KEYWORD)
    print(f"  Run ID     : {run_id}")
    print(f"  Dataset ID : {dataset_id}")

    status = wait_for_run(run_id)

    if status != "SUCCEEDED":
        print(f"Run did not succeed (status={status}).")
        sys.exit(1)

    items = get_dataset_items(dataset_id)

    if not items:
        print("No results returned by Apify.")
        return

    no_website = [
        b for b in items
        if not b.get("website")
        and not b.get("permanentlyClosed")
        and not b.get("temporarilyClosed")
    ]

    print_leads(no_website, total=len(items))


if __name__ == "__main__":
    main()
