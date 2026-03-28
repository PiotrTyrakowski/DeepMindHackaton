import type { Lead, LeadStatus } from '../types'

const BASE = '/api'

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  return res.json() as Promise<T>
}

// ─── Health ───────────────────────────────────────────────────────────────────

export async function healthCheck(): Promise<boolean> {
  try {
    await fetchJSON('/health')
    return true
  } catch {
    return false
  }
}

// ─── Leads ────────────────────────────────────────────────────────────────────

export async function getLeads(params?: {
  category?: string
  location?: string
}): Promise<{ total: number; leads: Lead[] }> {
  const qs = new URLSearchParams()
  if (params?.category) qs.set('category', params.category)
  if (params?.location) qs.set('location', params.location)
  const q = qs.toString()
  return fetchJSON(`/leads${q ? '?' + q : ''}`)
}

export async function updateLeadStatus(id: number, status: LeadStatus): Promise<Lead> {
  return fetchJSON(`/leads/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

// ─── Scraping ─────────────────────────────────────────────────────────────────

export interface ScrapeRequest {
  query: string
  location: string
  max_results: number
}

export interface ScrapeResult {
  run_id: string
  total_scraped: number
  no_website_count: number
  saved_to_db: number
}

export async function scrapeSingle(req: ScrapeRequest): Promise<ScrapeResult> {
  return fetchJSON('/scrape/single', {
    method: 'POST',
    body: JSON.stringify(req),
  })
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(): Promise<{
  categories: Array<{ category: string; total: number; with_phone: number; with_email: number }>
}> {
  return fetchJSON('/leads/categories')
}
