"""
FastAPI backend for scraping local businesses without websites via Apify.
Actor: LmLOOMYKuCUrYsda2 (Google Maps Business Scraper)
"""

import os
from typing import Optional
from datetime import timedelta

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from apify_client import ApifyClient

from targets import TARGETS

ACTOR_ID = "LmLOOMYKuCUrYsda2"

app = FastAPI(title="Business Scraper API", version="1.0.0")


def get_client() -> ApifyClient:
    token = os.environ.get("APIFY_API_TOKEN")
    if not token:
        raise HTTPException(status_code=500, detail="APIFY_API_TOKEN env var not set")
    return ApifyClient(token=token)


def build_actor_input(query: str, location: str, max_results: int = 5) -> dict:
    """Build input for the Apify Google Maps scraper actor."""
    return {
        "searchStringsArray": [f"{query} {location}"],
        "maxCrawledPlaces": max_results,
        # Filter to only businesses without a website
        "skipClosedPlaces": True,
        "website": "noWebsite",  # actor-specific filter
    }


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ScrapeRequest(BaseModel):
    query: str
    location: str
    max_results: int = 5


class BatchScrapeRequest(BaseModel):
    max_results_per_target: int = 2  # keep default low to stay within free tier


# ---------------------------------------------------------------------------
# In-memory job store (replace with DB in production)
# ---------------------------------------------------------------------------

jobs: dict[str, dict] = {}  # run_id -> {status, results, query, location}


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/targets")
def list_targets():
    """Return all 30 scraping targets."""
    return [{"query": q, "location": l} for q, l in TARGETS]


@app.post("/scrape")
def scrape_single(req: ScrapeRequest):
    """
    Run the Apify actor synchronously for a single (query, location) pair.
    Returns scraped businesses that have no website.
    """
    client = get_client()
    actor_input = build_actor_input(req.query, req.location, req.max_results)

    run = client.actor(ACTOR_ID).call(
        run_input=actor_input,
        run_timeout=timedelta(minutes=5),
    )

    if run["status"] != "SUCCEEDED":
        raise HTTPException(
            status_code=502,
            detail=f"Actor run failed with status: {run['status']}",
        )

    items = list(
        client.dataset(run["defaultDatasetId"]).iterate_items()
    )

    # Post-filter: keep only entries where website is missing/empty
    no_website = [
        item for item in items
        if not item.get("website")
    ]

    return {
        "run_id": run["id"],
        "query": req.query,
        "location": req.location,
        "total_scraped": len(items),
        "no_website_count": len(no_website),
        "results": no_website,
    }


@app.post("/scrape/batch")
def scrape_batch(req: BatchScrapeRequest, background_tasks: BackgroundTasks):
    """
    Kick off scraping for all 30 targets in the background.
    Returns a job list with run IDs that can be polled via /results/{run_id}.
    """
    client = get_client()
    started = []

    for query, location in TARGETS:
        actor_input = build_actor_input(query, location, req.max_results_per_target)
        run = client.actor(ACTOR_ID).start(run_input=actor_input)
        run_id = run["id"]
        jobs[run_id] = {
            "run_id": run_id,
            "status": "RUNNING",
            "query": query,
            "location": location,
            "results": [],
        }
        started.append({"run_id": run_id, "query": query, "location": location})

    return {
        "message": f"Started {len(started)} scraping jobs",
        "jobs": started,
    }


@app.get("/results/{run_id}")
def get_results(run_id: str):
    """
    Fetch results for a given Apify run ID.
    Works for both /scrape (sync) and /scrape/batch (async) runs.
    """
    client = get_client()

    try:
        run = client.run(run_id).get()
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Run not found: {e}")

    if run["status"] == "RUNNING":
        return {"run_id": run_id, "status": "RUNNING", "results": []}

    if run["status"] != "SUCCEEDED":
        raise HTTPException(
            status_code=502,
            detail=f"Run ended with status: {run['status']}",
        )

    items = list(
        client.dataset(run["defaultDatasetId"]).iterate_items()
    )
    no_website = [item for item in items if not item.get("website")]

    # Update in-memory store if this was a batch job
    if run_id in jobs:
        jobs[run_id]["status"] = run["status"]
        jobs[run_id]["results"] = no_website

    return {
        "run_id": run_id,
        "status": run["status"],
        "total_scraped": len(items),
        "no_website_count": len(no_website),
        "results": no_website,
    }


@app.get("/batch/status")
def batch_status():
    """
    Poll status of all batch jobs started via /scrape/batch.
    Refreshes status from Apify for any still-running jobs.
    """
    client = get_client()
    summary = []

    for run_id, job in jobs.items():
        if job["status"] == "RUNNING":
            try:
                run = client.run(run_id).get()
                job["status"] = run["status"]
                if run["status"] == "SUCCEEDED":
                    items = list(
                        client.dataset(run["defaultDatasetId"]).iterate_items()
                    )
                    job["results"] = [i for i in items if not i.get("website")]
            except Exception:
                pass

        summary.append({
            "run_id": run_id,
            "query": job["query"],
            "location": job["location"],
            "status": job["status"],
            "no_website_count": len(job.get("results", [])),
        })

    return {"jobs": summary}


@app.get("/batch/results")
def batch_results():
    """Return aggregated results from all completed batch jobs."""
    all_results = []
    for job in jobs.values():
        if job["status"] == "SUCCEEDED":
            for item in job.get("results", []):
                item["_scrape_query"] = job["query"]
                item["_scrape_location"] = job["location"]
                all_results.append(item)

    return {
        "total": len(all_results),
        "results": all_results,
    }
