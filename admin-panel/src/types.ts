export type LeadStatus =
  | 'NEW'
  | 'RESEARCHED'
  | 'WEBSITE_READY'
  | 'SMS_SENT'
  | 'CALLED'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'CONVERTED'

export type Priority = 'PREMIUM' | 'HIGH' | 'MEDIUM' | 'LOW'

export type ActiveTab = 'leads' | 'discover'
export type DiscoverState = 'idle' | 'scanning' | 'results'
export type SortOption = 'score' | 'rating' | 'name' | 'newest'
export type FilterChip = 'all' | 'no-website' | 'has-phone' | 'rating-4plus' | 'never-contacted' | 'hot-leads'

/** Raw lead as returned by FastAPI /leads */
export interface Lead {
  id: number
  place_id: string | null
  name: string
  category: string
  query: string
  location: string
  phone: string | null
  address: string | null
  email: string | null
  rating: number | null
  reviews_count: number | null
  google_maps_url: string | null
  facebook: string | null
  instagram: string | null
  twitter: string | null
  linkedin: string | null
  tiktok: string | null
  youtube: string | null
  apify_category: string | null
  apify_run_id: string | null
  scraped_at: string
  status: LeadStatus
}

/** Enriched lead with computed fields */
export interface EnrichedLead extends Lead {
  score: number
  priority: Priority
  ai_insight: string
  emoji: string
  services: string[]
  city: string
  state: string
}

export interface RecentSearch {
  query: string
  location: string
}

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}
