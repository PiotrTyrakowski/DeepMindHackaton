"""Scrape roofing contractors for all non-Gallup locations."""

import os
import sys
from datetime import timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from apify_client import ApifyClient
from database import init_db, upsert_lead, save_run, finish_run, rename_run

ACTOR_ID = "LmLOOMYKuCUrYsda2"

ROOFING_TARGETS = [
    ("roofing", "Tooele, UT"),
    ("roofing", "Hobbs, NM"),
    ("roofing", "Clovis, NM"),
    ("roofing", "Stillwater, OK"),
    ("roofing", "Vernal, UT"),
    ("roofing", "Dodge City, KS"),
    ("roofing", "Alamogordo, NM"),
    ("roofing", "Douglas, AZ"),
    ("roofing", "Rawlins, WY"),
    ("roofing", "Altus, OK"),
    ("roofing", "Greenwood, MS"),
    ("roofing", "Lufkin, TX"),
    ("roofing", "Crowley, LA"),
]


def main():
    client = ApifyClient(token=os.environ["APIFY_API_TOKEN"])
    init_db()

    total_saved = 0
    for query, location in ROOFING_TARGETS:
        actor_input = {
            "keyword": query,
            "location": location,
            "maxResults": 10,
            "filterPermanentlyClosed": True,
            "filterTemporarilyClosed": True,
            "extractContactDetails": True,
            "extractSocialMedia": True,
            "concurrency": 2,
            "detailsConcurrency": 10,
        }
        fake_id = f"pending-{query}-{location}"
        save_run(fake_id, query, location)
        print(f"Starting: {query} @ {location}...", flush=True)
        try:
            run = client.actor(ACTOR_ID).call(
                run_input=actor_input,
                timeout_secs=480,
                memory_mbytes=512,
            )
            run_id = run["id"]
            rename_run(fake_id, run_id)
            if run["status"] != "SUCCEEDED":
                finish_run(run_id, run["status"], 0)
                print(f"  FAILED: {run['status']}")
                continue
            items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
            no_website = [i for i in items if not i.get("website")]
            saved = sum(upsert_lead(i, query, location, run_id) for i in no_website)
            finish_run(run_id, "SUCCEEDED", saved)
            total_saved += saved
            print(f"  scraped={len(items)}  no_website={len(no_website)}  saved={saved}")
        except Exception as e:
            finish_run(fake_id, f"ERROR: {e}", 0)
            print(f"  ERROR: {e}")

    print(f"\nTotal saved: {total_saved}")


if __name__ == "__main__":
    main()
