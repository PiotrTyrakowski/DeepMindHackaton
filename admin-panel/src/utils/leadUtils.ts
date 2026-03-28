import type { Lead, EnrichedLead, Priority, LeadStatus } from '../types'

// ─── Emoji maps ───────────────────────────────────────────────────────────────

const QUERY_EMOJIS: Record<string, string> = {
  plumber: '🔧',
  electrician: '⚡',
  painter: '🎨',
  handyman: '🛠️',
  roofing: '🏠',
  'roofing contractor': '🏠',
  locksmith: '🔑',
  'hvac contractor': '❄️',
  'auto repair': '🚗',
  'auto body': '🚘',
  'auto body shop': '🚘',
  'tire shop': '🛞',
  'hair salon': '💇',
  'barber shop': '✂️',
  'nail salon': '💅',
  restaurant: '🍽️',
  'food truck': '🚚',
  bakery: '🥐',
  diner: '🍳',
  chiropractor: '🦴',
  dentist: '🦷',
  veterinarian: '🐾',
  'hardware store': '🔨',
  'clothing store': '👗',
  'furniture store': '🪑',
  'tax preparer': '📊',
  notary: '📝',
  'insurance agent': '📋',
  'pest control': '🐛',
  'cleaning service': '🧹',
  gym: '💪',
  landscaping: '🌿',
}

export function getEmoji(lead: Lead): string {
  return QUERY_EMOJIS[lead.query.toLowerCase()] ?? '📍'
}

// ─── Score & Priority ─────────────────────────────────────────────────────────

export function computeScore(lead: Lead): number {
  let score = 40 // all leads have no website
  if (lead.phone) score += 15
  if (lead.apify_category && lead.apify_category.length > 5) score += 15
  if (lead.rating !== null) score += Math.round((lead.rating / 5) * 12)
  if (lead.reviews_count && lead.reviews_count > 5) score += 5
  if (lead.email) score += 5
  if (lead.facebook || lead.instagram) score += 5
  if (lead.rating !== null && lead.rating < 3) score += 8 // urgency bonus
  return Math.min(score, 100)
}

export function getPriority(score: number): Priority {
  if (score >= 90) return 'PREMIUM'
  if (score >= 75) return 'HIGH'
  if (score >= 55) return 'MEDIUM'
  return 'LOW'
}

// ─── AI insight ───────────────────────────────────────────────────────────────

export function generateInsight(lead: Lead): string {
  const cat = lead.query || lead.category
  const loc = lead.location
  const hasSocial = !!(lead.facebook || lead.instagram)
  const r = lead.rating

  if (r !== null && r < 3) {
    return `${capitalize(cat)} in ${loc} with ${r.toFixed(1)} star rating and no web presence. Reputation issues likely losing customers to competitors — a professional site with testimonials could turn this around fast.`
  }
  if (hasSocial) {
    return `${capitalize(cat)} in ${loc} with active social media but no website. Followers have no place to convert — a landing page with booking could unlock significant revenue.`
  }
  if (!lead.phone) {
    return `${capitalize(cat)} in ${loc} with zero digital footprint and no phone listed. High-value target: any online presence would create immediate competitive advantage.`
  }
  return `${capitalize(cat)} in ${loc} with no web presence but an active phone line. A basic website with services listed and click-to-call could significantly increase inbound leads.`
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// ─── Services parser ──────────────────────────────────────────────────────────

export function parseServices(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as string[]
  } catch {
    // fallback: comma-separated
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean)
}

// ─── Location ─────────────────────────────────────────────────────────────────

export function parseLocation(location: string): { city: string; state: string } {
  const parts = location.split(',')
  return {
    city: parts[0]?.trim() ?? location,
    state: parts[1]?.trim() ?? '',
  }
}

// ─── Enrichment ───────────────────────────────────────────────────────────────

export function enrichLead(lead: Lead): EnrichedLead {
  const score = computeScore(lead)
  const { city, state } = parseLocation(lead.location)
  return {
    ...lead,
    score,
    priority: getPriority(score),
    ai_insight: generateInsight(lead),
    emoji: getEmoji(lead),
    services: parseServices(lead.apify_category),
    city,
    state,
  }
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(diff / 3600000)
  const d = Math.floor(diff / 86400000)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  return `${d}d ago`
}

// ─── Status config ────────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<
  LeadStatus,
  { color: string; label: string; dot: string; borderColor: string }
> = {
  NEW: { color: '#facc15', label: 'New lead', dot: '🟡', borderColor: '#facc15' },
  RESEARCHED: { color: '#60a5fa', label: 'Researched', dot: '🔵', borderColor: '#60a5fa' },
  WEBSITE_READY: { color: '#818cf8', label: 'Website ready', dot: '🟣', borderColor: '#818cf8' },
  SMS_SENT: { color: '#22d3ee', label: 'SMS sent', dot: '🔵', borderColor: '#22d3ee' },
  CALLED: { color: '#fb923c', label: 'Called', dot: '🟠', borderColor: '#fb923c' },
  INTERESTED: { color: '#4ade80', label: 'Interested', dot: '🟢', borderColor: '#4ade80' },
  NOT_INTERESTED: { color: '#64748b', label: 'Not interested', dot: '⚪', borderColor: '#64748b' },
  CONVERTED: { color: '#10b981', label: 'Converted', dot: '✅', borderColor: '#10b981' },
}

export const PRIORITY_CONFIG: Record<
  string,
  { label: string; icon: string; color: string; bg: string }
> = {
  PREMIUM: { label: 'PREMIUM', icon: '⚡', color: '#00ff88', bg: 'rgba(0,255,136,0.1)' },
  HIGH: { label: 'HIGH', icon: '🔥', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  MEDIUM: { label: 'MEDIUM', icon: '', color: '#94a3b8', bg: 'rgba(148,163,184,0.08)' },
  LOW: { label: 'LOW', icon: '', color: '#475569', bg: 'rgba(71,85,105,0.08)' },
}

// ─── Query display labels ─────────────────────────────────────────────────────

export const QUERY_DISPLAY: Record<string, { emoji: string; label: string }> = {
  plumber: { emoji: '🔧', label: 'Plumber' },
  electrician: { emoji: '⚡', label: 'Electrician' },
  roofing: { emoji: '🏠', label: 'Roofing' },
  'roofing contractor': { emoji: '🏠', label: 'Roofing' },
  'hair salon': { emoji: '💇', label: 'Hair Salon' },
  'auto repair': { emoji: '🚗', label: 'Auto Repair' },
  painter: { emoji: '🎨', label: 'Painter' },
  handyman: { emoji: '🛠️', label: 'Handyman' },
  locksmith: { emoji: '🔑', label: 'Locksmith' },
  'hvac contractor': { emoji: '❄️', label: 'HVAC' },
  'barber shop': { emoji: '✂️', label: 'Barber Shop' },
  landscaping: { emoji: '🌿', label: 'Landscaping' },
  'pest control': { emoji: '🐛', label: 'Pest Control' },
  'cleaning service': { emoji: '🧹', label: 'Cleaning' },
  gym: { emoji: '💪', label: 'Gym' },
  restaurant: { emoji: '🍽️', label: 'Restaurant' },
  dentist: { emoji: '🦷', label: 'Dentist' },
  veterinarian: { emoji: '🐾', label: 'Vet' },
}
