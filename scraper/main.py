"""
FastAPI backend for scraping local businesses without websites via Apify.
Actor: LmLOOMYKuCUrYsda2 (Google Maps Business Scraper)
"""

import os
import sys
from contextlib import asynccontextmanager
from datetime import timedelta
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from apify_client import ApifyClient

# Allow importing targets.py from project root
sys.path.insert(0, str(Path(__file__).parent.parent))
from targets import TARGETS  # noqa: E402

from database import (  # noqa: E402
    init_db, upsert_lead, save_run, finish_run, rename_run,
    get_leads, get_categories_summary, get_runs_summary, update_lead_status,
)

ACTOR_ID = "LmLOOMYKuCUrYsda2"


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Business Leads Scraper", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def get_client() -> ApifyClient:
    token = os.environ.get("APIFY_API_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="APIFY_API_TOKEN env var not set")
    return ApifyClient(token=token)


def build_actor_input(query: str, location: str, max_results: int = 5) -> dict:
    return {
        "keyword": query,
        "location": location,
        "maxResults": max_results,
        "filterPermanentlyClosed": True,
        "filterTemporarilyClosed": True,
        "extractContactDetails": True,
        "extractSocialMedia": True,
        "extractCountry": True,
        "extractGeographic": True,
        "extractBusyness": False,
        "extractPhotos": False,
        "extractReviews": False,
        "extractAmenities": False,
        "socialMediaPlatforms": ["facebook", "instagram", "twitter", "linkedin", "tiktok", "youtube"],
        "concurrency": 2,
        "detailsConcurrency": 10,
        "minRating": 0,
        "minReviews": 0,
    }


def run_all_sequential(client: ApifyClient, targets: list, max_results: int):
    """
    Run all targets one by one (sequential) so we never exceed the free-plan
    memory cap (8 192 MB total / 1 024 MB per run = max 8 concurrent).
    Runs entirely in a background thread.
    """
    for query, location in targets:
        actor_input = build_actor_input(query, location, max_results)
        fake_run_id = f"pending-{query}-{location}"
        save_run(fake_run_id, query, location)
        try:
            run = client.actor(ACTOR_ID).call(
                run_input=actor_input,
                run_timeout=timedelta(minutes=8),
                memory_mbytes=512,
            )
            run_id = run["id"]
            # update the placeholder row with the real run_id
            rename_run(fake_run_id, run_id)

            if run["status"] != "SUCCEEDED":
                finish_run(run_id, run["status"], 0)
                continue

            items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
            no_website = [i for i in items if not i.get("website")]
            saved = sum(upsert_lead(i, query, location, run_id) for i in no_website)
            finish_run(run_id, "SUCCEEDED", saved)

        except Exception as e:
            finish_run(fake_run_id, f"ERROR: {e}", 0)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ScrapeRequest(BaseModel):
    query: str
    location: str
    max_results: int = 5


class RunAllRequest(BaseModel):
    max_results_per_target: int = 3


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/targets")
def list_targets():
    return [{"query": q, "location": l} for q, l in TARGETS]


# --- Scraping ---

@app.post("/scrape/run-all")
def run_all(req: RunAllRequest, background_tasks: BackgroundTasks):
    """
    Start Apify runs for every target in targets.py.
    Results are collected in background and saved to SQLite.
    """
    client = get_client()
    started = []

    for query, location in TARGETS:
        actor_input = build_actor_input(query, location, req.max_results_per_target)
        run = client.actor(ACTOR_ID).start(run_input=actor_input)
        run_id = run["id"]

        save_run(run_id, query, location)
        background_tasks.add_task(collect_run, client, run_id, query, location)
        started.append({"run_id": run_id, "query": query, "location": location})

    return {
        "message": f"Started {len(started)} scraping jobs. Results will be saved to DB automatically.",
        "jobs": started,
    }


@app.post("/scrape/single")
def scrape_single(req: ScrapeRequest):
    """Run a single target synchronously and save results to DB."""
    client = get_client()
    actor_input = build_actor_input(req.query, req.location, req.max_results)

    run = client.actor(ACTOR_ID).call(
        run_input=actor_input,
        run_timeout=timedelta(minutes=5),
    )

    if run["status"] != "SUCCEEDED":
        raise HTTPException(status_code=502, detail=f"Actor failed: {run['status']}")

    items = list(client.dataset(run["defaultDatasetId"]).iterate_items())
    no_website = [i for i in items if not i.get("website")]

    saved = sum(upsert_lead(item, req.query, req.location, run["id"]) for item in no_website)
    finish_run(run["id"], "SUCCEEDED", saved)

    return {
        "run_id": run["id"],
        "total_scraped": len(items),
        "no_website_count": len(no_website),
        "saved_to_db": saved,
    }


# --- Leads ---

@app.get("/leads")
def leads(
    category: str | None = Query(default=None),
    location: str | None = Query(default=None),
):
    """Return all leads, optionally filtered by category or location."""
    results = get_leads(category=category, location=location)
    return {"total": len(results), "leads": results}


@app.get("/leads/categories")
def categories():
    """Return lead counts grouped by category."""
    return {"categories": get_categories_summary()}


class StatusUpdate(BaseModel):
    status: str


VALID_STATUSES = {
    "NEW", "RESEARCHED", "WEBSITE_READY", "SMS_SENT",
    "CALLED", "INTERESTED", "NOT_INTERESTED", "CONVERTED",
}


@app.patch("/leads/{lead_id}/status")
def update_status(lead_id: int, body: StatusUpdate):
    """Update the pipeline status of a lead."""
    if body.status not in VALID_STATUSES:
        raise HTTPException(status_code=422, detail=f"Invalid status: {body.status}")
    updated = update_lead_status(lead_id, body.status)
    if updated is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return updated


# --- Runs ---

@app.get("/runs")
def runs():
    """Return history of all Apify scraping runs."""
    return {"runs": get_runs_summary()}
