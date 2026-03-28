"""SQLite database layer for storing leads."""

import sqlite3
from datetime import datetime
from pathlib import Path

DB_PATH = Path(__file__).parent / "leads.db"

CATEGORY_MAP = {
    "plumber":            "Home Services",
    "electrician":        "Home Services",
    "painter":            "Home Services",
    "handyman":           "Home Services",
    "roofing":            "Home Services",
    "roofing contractor": "Home Services",
    "locksmith":          "Home Services",
    "hvac contractor":    "Home Services",
    "auto repair":        "Automotive",
    "auto body":          "Automotive",
    "auto body shop":     "Automotive",
    "tire shop":          "Automotive",
    "hair salon":         "Beauty & Personal Care",
    "barber shop":        "Beauty & Personal Care",
    "nail salon":         "Beauty & Personal Care",
    "restaurant":         "Food & Hospitality",
    "food truck":         "Food & Hospitality",
    "bakery":             "Food & Hospitality",
    "diner":              "Food & Hospitality",
    "chiropractor":       "Health",
    "dentist":            "Health",
    "veterinarian":       "Health",
    "hardware store":     "Retail",
    "clothing store":     "Retail",
    "furniture store":    "Retail",
    "tax preparer":       "Professional Services",
    "notary":             "Professional Services",
    "insurance agent":    "Professional Services",
    "pest control":       "Cleaning & Maintenance",
    "cleaning service":   "Cleaning & Maintenance",
    "gym":                "Fitness",
    "landscaping":        "Trades",
}


def get_category(query: str) -> str:
    return CATEGORY_MAP.get(query.lower(), "Other")


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS leads (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                place_id        TEXT,
                name            TEXT NOT NULL,
                category        TEXT NOT NULL,
                query           TEXT NOT NULL,
                location        TEXT NOT NULL,
                phone           TEXT,
                address         TEXT,
                street          TEXT,
                city            TEXT,
                state           TEXT,
                zip             TEXT,
                country         TEXT,
                latitude        REAL,
                longitude       REAL,
                email           TEXT,
                rating          REAL,
                reviews_count   INTEGER,
                google_maps_url TEXT,
                website         TEXT,
                -- social media (valuable when no website)
                facebook        TEXT,
                instagram       TEXT,
                twitter         TEXT,
                linkedin        TEXT,
                tiktok          TEXT,
                youtube         TEXT,
                -- raw category string from Apify
                apify_category  TEXT,
                apify_run_id    TEXT,
                scraped_at      TEXT NOT NULL,
                UNIQUE(place_id),
                UNIQUE(name, location)  -- fallback when placeId is missing
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS scrape_runs (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id      TEXT UNIQUE NOT NULL,
                query       TEXT NOT NULL,
                location    TEXT NOT NULL,
                status      TEXT NOT NULL DEFAULT 'RUNNING',
                leads_saved INTEGER DEFAULT 0,
                started_at  TEXT NOT NULL,
                finished_at TEXT
            )
        """)
        conn.commit()

        # Migrations: add columns introduced after initial schema
        migrations = [
            "ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'NEW'",
            "ALTER TABLE leads ADD COLUMN ai_summary TEXT",
            "ALTER TABLE leads ADD COLUMN services_detected TEXT",
            "ALTER TABLE leads ADD COLUMN confidence_city INTEGER",
            "ALTER TABLE leads ADD COLUMN confidence_state INTEGER",
            "ALTER TABLE leads ADD COLUMN confidence_region INTEGER",
        ]
        for sql in migrations:
            try:
                conn.execute(sql)
                conn.commit()
            except sqlite3.OperationalError:
                pass  # column already exists


def _extract_social(item: dict, platform: str) -> str | None:
    """Pull social media URL from nested socialMedia dict or top-level key."""
    social = item.get("socialMedia") or {}
    return social.get(platform) or item.get(platform) or None


def upsert_lead(item: dict, query: str, location: str, run_id: str) -> bool:
    """
    Insert lead if not already present.
    Field names from actor LmLOOMYKuCUrYsda2:
      businessName, phone, address, email, rating, reviewCount,
      website, category, socialMedia{facebook,instagram,...}
    Returns True if a new row was inserted.
    """
    name = (
        item.get("businessName")
        or item.get("title")
        or item.get("name")
        or ""
    ).strip()
    if not name:
        return False


    # city: direct field → primaryLocation.name → parse from location query
    city = (
        item.get("city")
        or (item.get("primaryLocation") or {}).get("name")
        or location.split(",")[0].strip()
    )
    # state: direct field → parse from location query (e.g. "Gallup, NM" → "NM")
    state = item.get("state")
    if not state and "," in location:
        state = location.split(",")[-1].strip()

    now = datetime.utcnow().isoformat()
    try:
        with get_conn() as conn:
            conn.execute(
                """
                INSERT OR IGNORE INTO leads
                    (place_id, name, category, query, location,
                     phone, address, street, city, state, zip, country,
                     latitude, longitude, email,
                     rating, reviews_count, google_maps_url, website,
                     facebook, instagram, twitter, linkedin, tiktok, youtube,
                     apify_category, apify_run_id, scraped_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
                """,
                (
                    item.get("placeId") or item.get("place_id"),
                    name,
                    get_category(query),
                    query,
                    location,
                    item.get("phone") or item.get("phoneUnformatted"),
                    item.get("address"),
                    item.get("street"),
                    city,
                    state,
                    item.get("zip"),
                    item.get("country") or item.get("countryCode"),
                    item.get("latitude"),
                    item.get("longitude"),
                    item.get("email"),
                    item.get("rating") or item.get("totalScore"),
                    item.get("reviewCount") or item.get("reviewsCount"),
                    item.get("googleMapsUrl") or item.get("url"),
                    item.get("website") or None,
                    _extract_social(item, "facebook"),
                    _extract_social(item, "instagram"),
                    _extract_social(item, "twitter"),
                    _extract_social(item, "linkedin"),
                    _extract_social(item, "tiktok"),
                    _extract_social(item, "youtube"),
                    item.get("category"),
                    run_id,
                    now,
                ),
            )
            conn.commit()
            return conn.execute("SELECT changes()").fetchone()[0] > 0
    except sqlite3.Error:
        return False


def save_run(run_id: str, query: str, location: str):
    with get_conn() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO scrape_runs (run_id, query, location, status, started_at) VALUES (?,?,?,?,?)",
            (run_id, query, location, "RUNNING", datetime.utcnow().isoformat()),
        )
        conn.commit()


def rename_run(old_id: str, new_id: str):
    """Replace placeholder run_id with the real Apify run ID."""
    with get_conn() as conn:
        conn.execute(
            "UPDATE scrape_runs SET run_id=? WHERE run_id=?",
            (new_id, old_id),
        )
        conn.commit()


def finish_run(run_id: str, status: str, leads_saved: int):
    with get_conn() as conn:
        conn.execute(
            "UPDATE scrape_runs SET status=?, leads_saved=?, finished_at=? WHERE run_id=?",
            (status, leads_saved, datetime.utcnow().isoformat(), run_id),
        )
        conn.commit()


def get_leads(category: str | None = None, location: str | None = None) -> list[dict]:
    with get_conn() as conn:
        sql = "SELECT * FROM leads WHERE 1=1"
        params: list = []
        if category:
            sql += " AND category = ?"
            params.append(category)
        if location:
            sql += " AND location LIKE ?"
            params.append(f"%{location}%")
        sql += " ORDER BY rating DESC NULLS LAST, reviews_count DESC NULLS LAST"
        return [dict(r) for r in conn.execute(sql, params).fetchall()]


def get_categories_summary() -> list[dict]:
    with get_conn() as conn:
        rows = conn.execute("""
            SELECT category,
                   COUNT(*)        AS total,
                   COUNT(phone)    AS with_phone,
                   COUNT(email)    AS with_email
            FROM leads
            GROUP BY category
            ORDER BY total DESC
        """).fetchall()
        return [dict(r) for r in rows]


def update_lead_status(lead_id: int, status: str) -> dict | None:
    with get_conn() as conn:
        conn.execute(
            "UPDATE leads SET status=? WHERE id=?",
            (status, lead_id),
        )
        conn.commit()
        row = conn.execute("SELECT * FROM leads WHERE id=?", (lead_id,)).fetchone()
        return dict(row) if row else None


def get_runs_summary() -> list[dict]:
    with get_conn() as conn:
        return [dict(r) for r in conn.execute(
            "SELECT * FROM scrape_runs ORDER BY started_at DESC"
        ).fetchall()]
