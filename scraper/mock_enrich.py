"""
Mock-enrich all leads with display-ready data:
  - status column
  - ai_summary
  - services_detected (JSON list)
  - confidence_city / confidence_state / confidence_region (0-100)
  - fill missing phone / address / email / facebook where NULL
"""

import json
import random
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent / "leads.db"

# ── area codes by state ───────────────────────────────────────────────────────
AREA_CODES = {
    "NM": ["505", "575"],
    "UT": ["385", "435", "801"],
    "TX": ["210", "214", "469", "512", "682", "713", "817", "832", "903", "915"],
    "AZ": ["480", "520", "602", "623", "928"],
    "CO": ["303", "719", "720", "970"],
    "ID": ["208"],
    "MT": ["406"],
    "WY": ["307"],
    "SD": ["605"],
    "ND": ["701"],
    "NE": ["308", "402", "531"],
    "KS": ["316", "620", "785", "913"],
    "OK": ["405", "539", "580", "918"],
    "AR": ["479", "501", "870"],
    "MS": ["228", "601", "662", "769"],
    "AL": ["205", "251", "256", "334", "938"],
    "WV": ["304", "681"],
}

STREETS = [
    "Main St", "Oak Ave", "Elm St", "Maple Dr", "Cedar Ln",
    "Pine Rd", "Washington Blvd", "Jefferson Ave", "Lincoln St", "Park Ave",
    "Commerce Dr", "Industrial Blvd", "Center St", "Highland Ave", "Valley Rd",
    "Riverside Dr", "Sunset Blvd", "Broadway", "Market St", "Church St",
]

ZIP_PREFIXES = {
    "NM": "87", "UT": "84", "TX": "78", "AZ": "85", "CO": "80",
    "ID": "83", "MT": "59", "WY": "82", "SD": "57", "ND": "58",
    "NE": "68", "KS": "67", "OK": "73", "AR": "72", "MS": "39",
    "AL": "35", "WV": "25",
}

SERVICES_MAP = {
    "plumber":            ["Plumber", "Drain cleaning", "Water heater service", "Pipe repair", "Leak detection"],
    "electrician":        ["Electrician", "Electrical wiring", "Panel upgrades", "Lighting installation", "EV charger install"],
    "painter":            ["Painter", "Interior painting", "Exterior painting", "Cabinet refinishing", "Pressure washing"],
    "handyman":           ["Handyman", "Home repairs", "Carpentry", "Drywall repair", "Fixture installation"],
    "roofing":            ["Roofing", "Roof repair", "Gutters", "Storm damage repair", "Shingle replacement"],
    "roofing contractor": ["Roofing", "Flat roofing", "Roof inspection", "Emergency tarping", "Skylights"],
    "locksmith":          ["Locksmith", "Lock installation", "Emergency lockout", "Key duplication", "Smart locks"],
    "hvac contractor":    ["HVAC", "AC repair", "Furnace service", "Duct cleaning", "Smart thermostat install"],
    "auto repair":        ["Auto repair", "Oil change", "Brake service", "Engine diagnostics", "Transmission service"],
    "auto body":          ["Auto body", "Collision repair", "Paint matching", "Dent removal", "Frame straightening"],
    "auto body shop":     ["Auto body", "Bumper repair", "Windshield replacement", "Rust removal", "Detailing"],
    "tire shop":          ["Tire shop", "Tire rotation", "Wheel alignment", "Flat tire repair", "Rim repair"],
    "hair salon":         ["Hair salon", "Haircuts", "Color & highlights", "Keratin treatment", "Blowouts"],
    "barber shop":        ["Barber", "Haircuts", "Beard trim", "Hot towel shave", "Kids cuts"],
    "nail salon":         ["Nail salon", "Manicure", "Pedicure", "Gel nails", "Acrylic extensions"],
    "restaurant":         ["Restaurant", "Dine-in", "Takeout", "Catering", "Private events"],
    "food truck":         ["Food truck", "Street food", "Corporate catering", "Event catering", "Festival vendor"],
    "bakery":             ["Bakery", "Custom cakes", "Pastries", "Artisan bread", "Wedding cakes"],
    "diner":              ["Diner", "Breakfast", "Lunch", "American cuisine", "Daily specials"],
    "chiropractor":       ["Chiropractor", "Spinal adjustment", "Back pain relief", "Sports injuries", "Massage therapy"],
    "dentist":            ["Dentist", "Teeth cleaning", "Fillings", "Cosmetic dentistry", "Teeth whitening"],
    "veterinarian":       ["Veterinarian", "Pet checkups", "Vaccinations", "Surgery", "Dental cleaning"],
    "hardware store":     ["Hardware store", "Tools & equipment", "Building supplies", "Paint & coatings", "Plumbing parts"],
    "clothing store":     ["Clothing store", "Men's fashion", "Women's fashion", "Alterations", "Accessories"],
    "furniture store":    ["Furniture store", "Custom furniture", "Home décor", "Delivery & assembly", "Mattresses"],
    "tax preparer":       ["Tax preparation", "IRS filing", "Business taxes", "Bookkeeping", "Financial planning"],
    "notary":             ["Notary public", "Document notarization", "Apostille", "Mobile notary", "Legal documents"],
    "insurance agent":    ["Insurance", "Life insurance", "Auto insurance", "Home insurance", "Business coverage"],
    "pest control":       ["Pest control", "Extermination", "Rodent removal", "Termite treatment", "Bed bug treatment"],
    "cleaning service":   ["Cleaning service", "Deep cleaning", "Move-out cleaning", "Commercial cleaning", "Window cleaning"],
    "gym":                ["Gym", "Personal training", "Group fitness classes", "Weight loss program", "Nutrition coaching"],
    "landscaping":        ["Landscaping", "Lawn care", "Tree trimming", "Irrigation systems", "Hardscaping"],
}

AI_TEMPLATES = {
    "no_website_social": (
        "{business_type} in {city}, {state} with active social media presence but no website. "
        "Followers have no place to convert — a landing page with {cta} could unlock significant revenue."
    ),
    "no_website_no_social": (
        "{business_type} in {city}, {state} operating entirely by word of mouth with no digital presence. "
        "High opportunity: even a basic contact page would capture search traffic they're currently losing."
    ),
    "has_website": (
        "{business_type} in {city}, {state} with an existing website. "
        "Site may be outdated or not mobile-optimized — a modern redesign or local SEO push could drive more conversions."
    ),
}

BUSINESS_TYPE_NAMES = {
    "plumber": "Plumber",
    "electrician": "Electrician",
    "painter": "Painter",
    "handyman": "Handyman",
    "roofing": "Roofing contractor",
    "roofing contractor": "Roofing contractor",
    "locksmith": "Locksmith",
    "hvac contractor": "HVAC contractor",
    "auto repair": "Auto repair shop",
    "auto body": "Auto body shop",
    "auto body shop": "Auto body shop",
    "tire shop": "Tire shop",
    "hair salon": "Hair salon",
    "barber shop": "Barber shop",
    "nail salon": "Nail salon",
    "restaurant": "Restaurant",
    "food truck": "Food truck",
    "bakery": "Bakery",
    "diner": "Diner",
    "chiropractor": "Chiropractic office",
    "dentist": "Dental office",
    "veterinarian": "Veterinary clinic",
    "hardware store": "Hardware store",
    "clothing store": "Clothing boutique",
    "furniture store": "Furniture store",
    "tax preparer": "Tax preparation service",
    "notary": "Notary service",
    "insurance agent": "Insurance agency",
    "pest control": "Pest control company",
    "cleaning service": "Cleaning service",
    "gym": "Fitness center",
    "landscaping": "Landscaping company",
}

CTA_MAP = {
    "plumber": "online booking",
    "electrician": "instant quote form",
    "painter": "free estimate form",
    "handyman": "job request form",
    "roofing": "free inspection booking",
    "roofing contractor": "free inspection booking",
    "locksmith": "emergency contact page",
    "hvac contractor": "seasonal tune-up booking",
    "auto repair": "appointment scheduling",
    "auto body": "damage estimate form",
    "auto body shop": "damage estimate form",
    "tire shop": "tire order & install booking",
    "hair salon": "appointment booking",
    "barber shop": "appointment booking",
    "nail salon": "appointment booking",
    "restaurant": "reservations & menu",
    "food truck": "event inquiry form",
    "bakery": "custom order form",
    "diner": "online menu & hours",
    "chiropractor": "new patient intake form",
    "dentist": "new patient scheduling",
    "veterinarian": "pet appointment booking",
    "hardware store": "product catalog & inventory",
    "clothing store": "online shop",
    "furniture store": "showroom appointment",
    "tax preparer": "consultation booking",
    "notary": "mobile appointment scheduling",
    "insurance agent": "quote request form",
    "pest control": "free inspection booking",
    "cleaning service": "recurring service booking",
    "gym": "free trial signup",
    "landscaping": "seasonal estimate form",
}

STATUSES = ["NEW", "RESEARCHED", "WEBSITE_READY", "SMS_SENT", "CALLED", "INTERESTED", "NOT_INTERESTED", "CONVERTED"]
STATUS_WEIGHTS = [20, 15, 10, 20, 15, 10, 5, 5]  # realistic pipeline distribution


def rand_phone(state: str) -> str:
    codes = AREA_CODES.get(state, ["555"])
    area = random.choice(codes)
    return f"+1{area}{random.randint(2,9)}{random.randint(10,99)}{random.randint(1000,9999)}"


def rand_address(city: str, state: str) -> str:
    num = random.randint(100, 9999)
    street = random.choice(STREETS)
    prefix = ZIP_PREFIXES.get(state, "10")
    zipcode = f"{prefix}{random.randint(100, 999)}"
    return f"{num} {street}, {city}, {state} {zipcode}"


def make_ai_summary(query: str, city: str, state: str, has_website: bool, has_social: bool) -> str:
    btype = BUSINESS_TYPE_NAMES.get(query.lower(), query.title())
    cta = CTA_MAP.get(query.lower(), "an online booking page")
    if has_website:
        tmpl = AI_TEMPLATES["has_website"]
    elif has_social:
        tmpl = AI_TEMPLATES["no_website_social"]
    else:
        tmpl = AI_TEMPLATES["no_website_no_social"]
    return tmpl.format(business_type=btype, city=city, state=state, cta=cta)


def make_services(query: str) -> str:
    services = SERVICES_MAP.get(query.lower(), [query.title()])
    # pick 2-4 services randomly
    k = random.randint(min(2, len(services)), min(4, len(services)))
    return json.dumps(random.sample(services, k))


def make_confidences():
    base = random.randint(72, 96)
    return (
        min(100, base + random.randint(-5, 5)),
        min(100, base - random.randint(5, 15)),
        min(100, base - random.randint(15, 25)),
    )


def migrate(conn: sqlite3.Connection):
    new_cols = [
        ("status",             "TEXT NOT NULL DEFAULT 'NEW'"),
        ("ai_summary",         "TEXT"),
        ("services_detected",  "TEXT"),
        ("confidence_city",    "INTEGER"),
        ("confidence_state",   "INTEGER"),
        ("confidence_region",  "INTEGER"),
    ]
    for col, defn in new_cols:
        try:
            conn.execute(f"ALTER TABLE leads ADD COLUMN {col} {defn}")
            print(f"  + added column: {col}")
        except sqlite3.OperationalError:
            pass  # already exists
    conn.commit()


def enrich(conn: sqlite3.Connection):
    random.seed(42)  # reproducible
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM leads").fetchall()

    updated = 0
    for row in rows:
        r = dict(row)
        state = r.get("state") or "NM"
        city  = r.get("city")  or r.get("location", "").split(",")[0].strip()
        query = r.get("query") or ""

        phone = r.get("phone") or rand_phone(state)
        address = r.get("address") or rand_address(city, state)

        has_website = bool(r.get("website"))
        has_social  = any(r.get(p) for p in ["facebook", "instagram", "twitter", "linkedin"])

        # mock email for ~40% of leads (realistic)
        email = r.get("email")
        if not email and random.random() < 0.40:
            slug = r["name"].lower().replace(" ", "").replace("'", "")[:12]
            email = f"info@{slug}.com"

        # mock facebook for ~55% without one (realistic)
        facebook = r.get("facebook")
        if not facebook and random.random() < 0.55:
            slug = r["name"].lower().replace(" ", "").replace("'", "")[:20]
            facebook = f"https://facebook.com/{slug}"
            has_social = True

        ai_summary = make_ai_summary(query, city, state, has_website, has_social)
        services   = make_services(query)
        conf_city, conf_state, conf_region = make_confidences()
        status = random.choices(STATUSES, weights=STATUS_WEIGHTS)[0]

        conn.execute(
            """UPDATE leads SET
                phone=?, address=?, email=?, facebook=?,
                status=?, ai_summary=?, services_detected=?,
                confidence_city=?, confidence_state=?, confidence_region=?
               WHERE id=?""",
            (phone, address, email, facebook,
             status, ai_summary, services,
             conf_city, conf_state, conf_region,
             r["id"]),
        )
        updated += 1

    conn.commit()
    print(f"  Enriched {updated} leads")


def main():
    conn = sqlite3.connect(str(DB_PATH))
    print("Running migrations...")
    migrate(conn)
    print("Enriching leads with mock data...")
    enrich(conn)

    # quick verification
    row = conn.execute(
        "SELECT name, phone, address, ai_summary, services_detected, status, confidence_city FROM leads LIMIT 1"
    ).fetchone()
    print("\nSample row:")
    cols = ["name", "phone", "address", "ai_summary", "services_detected", "status", "confidence_city"]
    for k, v in zip(cols, row):
        val = v[:80] + "…" if isinstance(v, str) and len(v) > 80 else v
        print(f"  {k}: {val}")

    conn.close()
    print("\nDone.")


if __name__ == "__main__":
    main()
