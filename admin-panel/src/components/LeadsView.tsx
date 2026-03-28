import { useState } from 'react'
import type { EnrichedLead, FilterChip, SortOption } from '../types'
import LeadCard from './LeadCard'

interface Props {
  leads: EnrichedLead[]
  search: string
  activeCategory: string
  onSelectLead: (l: EnrichedLead) => void
  onCall: (l: EnrichedLead) => void
  onGoDiscover: () => void
}

const FILTER_CHIPS: { id: FilterChip; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'no-website', label: 'No website' },
  { id: 'has-phone', label: 'Has phone' },
  { id: 'rating-4plus', label: 'Rating 4+' },
  { id: 'never-contacted', label: 'Never contacted' },
  { id: 'hot-leads', label: '🔥 Hot leads' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'score', label: 'Lead score ↓' },
  { value: 'rating', label: 'Rating ↓' },
  { value: 'name', label: 'Name A-Z' },
  { value: 'newest', label: 'Newest first' },
]

export default function LeadsView({ leads, search, activeCategory, onSelectLead, onCall, onGoDiscover }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterChip>('all')
  const [sortBy, setSortBy] = useState<SortOption>('score')

  // Stats
  const avgRating = leads.filter((l) => l.rating !== null).reduce((acc, l) => acc + (l.rating ?? 0), 0) /
    (leads.filter((l) => l.rating !== null).length || 1)
  const hotLeads = leads.filter((l) => l.score >= 80).length

  // Filter
  const filtered = leads
    .filter((l) => {
      if (search && !l.name.toLowerCase().includes(search.toLowerCase()) &&
          !l.location.toLowerCase().includes(search.toLowerCase())) return false
      if (activeCategory !== 'all' && l.query.toLowerCase() !== activeCategory) return false
      if (activeFilter === 'has-phone' && !l.phone) return false
      if (activeFilter === 'rating-4plus' && (l.rating === null || l.rating < 4)) return false
      if (activeFilter === 'never-contacted' && !['NEW', 'RESEARCHED'].includes(l.status)) return false
      if (activeFilter === 'hot-leads' && l.score < 80) return false
      return true
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score
      if (sortBy === 'rating') return (b.rating ?? 0) - (a.rating ?? 0)
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'newest') return new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime()
      return 0
    })

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 p-4 pb-0">
        <StatCard label="Total Leads" value={leads.length} />
        <StatCard label="No Website" value={leads.length} accent="red" suffix="🔴" />
        <StatCard label="Avg Rating" value={isNaN(avgRating) ? '—' : avgRating.toFixed(1)} suffix="★" starColor />
        <StatCard label="Hot Leads" value={hotLeads} suffix="🔥" accent="amber" />
      </div>

      {/* Filter row */}
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {FILTER_CHIPS.map((chip) => (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className={`filter-chip px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                activeFilter === chip.id
                  ? 'bg-green-500/10 border-accent text-accent'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent/50 cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Cards grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {filtered.length === 0 ? (
          <EmptyState onGoDiscover={onGoDiscover} />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onClick={() => onSelectLead(lead)}
                onCall={(e) => { e.stopPropagation(); onCall(lead) }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, accent, suffix, starColor,
}: {
  label: string
  value: string | number
  accent?: 'red' | 'amber'
  suffix?: string
  starColor?: boolean
}) {
  const accentColors = {
    red: 'text-red-400',
    amber: 'text-amber-400',
  }
  const valueColor = accent ? accentColors[accent] : 'text-slate-100'

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className={`text-2xl font-bold tabular-nums flex items-baseline gap-1 ${valueColor}`}>
        {value}
        {suffix && <span className={`text-base ${starColor ? 'text-yellow-400' : ''}`}>{suffix}</span>}
      </div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ onGoDiscover }: { onGoDiscover: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <div className="text-slate-300 font-semibold text-lg mb-2">No leads match your filters</div>
      <div className="text-slate-500 text-sm mb-6">Try adjusting filters or discover new leads</div>
      <button
        onClick={onGoDiscover}
        className="flex items-center gap-2 bg-accent text-slate-950 font-bold px-5 py-2.5 rounded-lg hover:bg-accent/90 transition-all text-sm"
      >
        Go to Discover →
      </button>
    </div>
  )
}
