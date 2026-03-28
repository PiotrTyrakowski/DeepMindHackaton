const SCRAPER_API_URL = process.env.SCRAPER_API_URL ?? "http://localhost:8000";

export interface ScraperLead {
  id: number;
  name: string;
  category: string;
  query: string;
  location: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  rating: number | null;
  reviews_count: number | null;
  google_maps_url: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  linkedin: string | null;
  status: "WAITING_FOR_CALL" | "CALLED" | "BOGHT" | string;
  ai_summary: string | null;
  services_detected: string | null;
  scraped_at: string;
}

export interface CategorySummary {
  category: string;
  total: number;
  with_phone: number;
  with_email: number;
}

export async function getLeads(category?: string, location?: string): Promise<ScraperLead[]> {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (location) params.append("location", location);
  try {
    const res = await fetch(`${SCRAPER_API_URL}/leads?${params}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.leads ?? []) as ScraperLead[];
  } catch {
    return [];
  }
}

export async function getCategoriesSummary(): Promise<CategorySummary[]> {
  try {
    const res = await fetch(`${SCRAPER_API_URL}/leads/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.categories ?? []) as CategorySummary[];
  } catch {
    return [];
  }
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diffMs / 3_600_000);
  const d = Math.floor(h / 24);
  if (h < 1) return "< 1h ago";
  if (h < 24) return `${h}h ago`;
  if (d < 30) return `${d}d ago`;
  return `${Math.floor(d / 30)}mo ago`;
}

// --- mock fallback used when the scraper API is offline ---
export const MOCK_LEADS: ScraperLead[] = [
  {
    id: 1, name: "Roto-Rooter Plumbing", category: "Home Services", query: "plumber",
    location: "Gallup, NM", phone: "+15052455012", email: null, address: "14 Main St, Gallup, NM 87301",
    city: "Gallup", state: "NM", zip: "87301", rating: 4.2, reviews_count: 38,
    google_maps_url: null, facebook: "https://facebook.com/rotorooter", instagram: null,
    twitter: null, linkedin: null, status: "WAITING_FOR_CALL", ai_summary: null,
    services_detected: '["Plumber","Drain cleaning","Water heater service"]',
    scraped_at: new Date(Date.now() - 2 * 3_600_000).toISOString(),
  },
  {
    id: 2, name: "Horizon Plumbing & Heating", category: "Home Services", query: "plumber",
    location: "Gallup, NM", phone: "+15058388359", email: null, address: "220 Oak Ave, Gallup, NM 87301",
    city: "Gallup", state: "NM", zip: "87301", rating: 4.7, reviews_count: 91, google_maps_url: null,
    facebook: "https://facebook.com/horizonplumbing", instagram: null, twitter: null, linkedin: null,
    status: "WAITING_FOR_CALL", ai_summary: null,
    services_detected: '["Plumbing","Heating","HVAC"]',
    scraped_at: new Date(Date.now() - 3 * 3_600_000).toISOString(),
  },
  {
    id: 3, name: "Miller Auto Repair", category: "Automotive", query: "auto repair",
    location: "Hobbs, NM", phone: "+15755174946", email: null, address: "88 Elm St, Hobbs, NM 88240",
    city: "Hobbs", state: "NM", zip: "88240", rating: 3.9, reviews_count: 22,
    google_maps_url: null, facebook: null, instagram: null, twitter: null, linkedin: null,
    status: "CALLED", ai_summary: null,
    services_detected: '["Oil change","Brake repair","Engine diagnostics"]',
    scraped_at: new Date(Date.now() - 24 * 3_600_000).toISOString(),
  },
  {
    id: 4, name: "Frontier Diner", category: "Food & Hospitality", query: "diner",
    location: "Dodge City, KS", phone: "+16205550447", email: null,
    address: "5 Front St, Dodge City, KS 67801", city: "Dodge City", state: "KS", zip: "67801",
    rating: 4.4, reviews_count: 155, google_maps_url: null,
    facebook: "https://facebook.com/frontierdiner", instagram: null,
    twitter: null, linkedin: null, status: "BOGHT", ai_summary: null,
    services_detected: '["Breakfast","Lunch","Catering"]',
    scraped_at: new Date(Date.now() - 36 * 3_600_000).toISOString(),
  },
  {
    id: 5, name: "Dallago Corporation", category: "Home Services", query: "plumber",
    location: "Gallup, NM", phone: "+15753556635", email: null, address: "33 Pine Rd, Gallup, NM 87301",
    city: "Gallup", state: "NM", zip: "87301", rating: 4.6, reviews_count: 47, google_maps_url: null,
    facebook: "https://facebook.com/dallagocorporation", instagram: null,
    twitter: null, linkedin: null, status: "BOGHT", ai_summary: null,
    services_detected: '["Electrical repairs","Panel upgrades","Lighting installation"]',
    scraped_at: new Date(Date.now() - 72 * 3_600_000).toISOString(),
  },
  {
    id: 6, name: "Capital Plumbing", category: "Home Services", query: "plumber",
    location: "Gallup, NM", phone: "+15756184456", email: null,
    address: "77 Cedar Blvd, Gallup, NM 87301", city: "Gallup", state: "NM", zip: "87301",
    rating: 4.1, reviews_count: 18, google_maps_url: null, facebook: "https://facebook.com/capitalplumbing",
    instagram: null, twitter: null, linkedin: null, status: "WAITING_FOR_CALL", ai_summary: null,
    services_detected: '["Haircuts","Shaves","Beard trims"]',
    scraped_at: new Date(Date.now() - 48 * 3_600_000).toISOString(),
  },
  {
    id: 7, name: "Benjamin Franklin Plumbing", category: "Home Services", query: "plumber",
    location: "Gallup, NM", phone: "+15758564593", email: null,
    address: "101 Maple Dr, Gallup, NM 87301", city: "Gallup", state: "NM", zip: "87301",
    rating: 3.8, reviews_count: 9, google_maps_url: null, facebook: null, instagram: null,
    twitter: null, linkedin: null, status: "CALLED", ai_summary: null,
    services_detected: '["Termite control","Rodent removal","Bed bugs"]',
    scraped_at: new Date(Date.now() - 96 * 3_600_000).toISOString(),
  },
  {
    id: 8, name: "High Plains Roofing", category: "Home Services", query: "roofing",
    location: "Amarillo, TX", phone: "+18065550825", email: null,
    address: "56 Birch Ave, Amarillo, TX 79101", city: "Amarillo", state: "TX", zip: "79101",
    rating: 4.5, reviews_count: 63, google_maps_url: null,
    facebook: "https://facebook.com/highplainsroofing", instagram: null, twitter: null, linkedin: null,
    status: "WAITING_FOR_CALL", ai_summary: null,
    services_detected: '["Roof repair","New roofs","Gutters"]',
    scraped_at: new Date(Date.now() - 120 * 3_600_000).toISOString(),
  },
];
