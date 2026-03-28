"""
Fetch all succeeded Apify runs for actor LmLOOMYKuCUrYsda2,
pull each dataset, and save businesses WITHOUT a website to leads.db.
"""

import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from apify_client import ApifyClient
from database import init_db, upsert_lead, save_run, finish_run, rename_run, CATEGORY_MAP

ACTOR_ID = "LmLOOMYKuCUrYsda2"
TOKEN = os.environ.get("APIFY_API_TOKEN")


def get_run_input(client: ApifyClient, store_id: str) -> dict:
    record = client.key_value_store(store_id).get_record("INPUT")
    return record["value"] if record else {}


def main():
    client = ApifyClient(token=TOKEN)
    init_db()

    print("Fetching all succeeded runs...")
    runs_page = client.actor(ACTOR_ID).runs().list(status="SUCCEEDED", limit=200)
    runs = runs_page.items
    print(f"  Found {len(runs)} succeeded run(s)\n")

    total_saved = 0
    total_skipped = 0

    for run in runs:
        run_id = run["id"]
        dataset_id = run["defaultDatasetId"]
        store_id = run["defaultKeyValueStoreId"]

        inp = get_run_input(client, store_id)
        query = inp.get("keyword", "unknown")
        location = inp.get("location", "unknown")

        print(f"[{run_id}] {query} @ {location}")

        save_run(run_id, query, location)

        items = list(client.dataset(dataset_id).iterate_items())
        saved = sum(upsert_lead(i, query, location, run_id) for i in items)
        finish_run(run_id, "SUCCEEDED", saved)

        no_website = sum(1 for i in items if not i.get("website"))
        print(f"  scraped={len(items)}  no_website={no_website}  saved={saved}  skipped(dup)={len(items)-saved}")
        total_saved += saved
        total_skipped += (len(items) - saved)

    print(f"\nDone. Total saved to DB: {total_saved}  |  skipped: {total_skipped}")


if __name__ == "__main__":
    main()
