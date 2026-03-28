import { useState } from 'react'
import type { ActiveTab, EnrichedLead, RecentSearch } from '../types'
import { QUERY_DISPLAY, STATUS_CONFIG } from '../utils/leadUtils'

interface Props {
  activeTab: ActiveTab
  setActiveTab: (t: ActiveTab) => void
  search: string
  setSearch: (s: string) => void
  activeCategory: string
  setActiveCategory: (c: string) => void
  leads: EnrichedLead[]
  totalInDb: number
  recentSearches: RecentSearch[]
  onDiscover: (query: string, location: string, maxResults: number) => void
}

export default function Sidebar({
  activeTab, setActiveTab, search, setSearch,
  activeCategory, setActiveCategory, leads,
  totalInDb, recentSearches, onDiscover,
}: Props) {
  const [discQuery, setDiscQuery] = useState('')
  const [discLocation, setDiscLocation] = useState('')
  const [discMax, setDiscMax] = useState('30')

  // Build category counts from actual leads
  const categoryCounts = leads.reduce<Record<string, number>>((acc, l) => {
    const key = l.query.toLowerCase()
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})

  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 9)

  // Pipeline counters
  const pipeline = {
    new: leads.filter((l) => l.status === 'NEW').length,
    website: leads.filter((l) => l.status === 'WEBSITE_READY').length,
    called: leads.filter((l) => l.status === 'CALLED').length,
    converted: leads.filter((l) => l.status === 'CONVERTED').length,
  }

  const handleDiscover = (e: React.FormEvent) => {
    e.preventDefault()
    if (discQuery && discLocation) {
      onDiscover(discQuery, discLocation, parseInt(discMax) || 30)
    }
  }

  const fillSuggest = (query: string, location: string) => {
    setDiscQuery(query)
    setDiscLocation(location)
    onDiscover(query, location, parseInt(discMax) || 30)
  }

  return (
    <aside className="w-60 flex-shrink-0 fixed left-0 top-0 h-full z-20 bg-slate-900/95 backdrop-blur border-r border-slate-800/80 flex flex-col">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-slate-800">
        <div className="font-jetbrains font-bold text-accent tracking-[0.25em] text-sm">
          WEBGENIUS
        </div>
        <div className="text-slate-500 text-xs mt-0.5 font-mono">Lead Intelligence</div>
      </div>

      {/* Tab switcher */}
      <div className="px-3 pt-3 pb-2 flex gap-1">
        {(['leads', 'discover'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${
              activeTab === tab
                ? 'bg-slate-800 text-accent border-b-2 border-accent'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <span>{tab === 'leads' ? '📋' : '🔍'}</span>
            <span className="capitalize">{tab}</span>
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {activeTab === 'leads' ? (
          <LeadsSidebarContent
            search={search}
            setSearch={setSearch}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            sortedCategories={sortedCategories}
            totalLeads={leads.length}
            pipeline={pipeline}
          />
        ) : (
          <DiscoverSidebarContent
            discQuery={discQuery}
            setDiscQuery={setDiscQuery}
            discLocation={discLocation}
            setDiscLocation={setDiscLocation}
            discMax={discMax}
            setDiscMax={setDiscMax}
            onSubmit={handleDiscover}
            recentSearches={recentSearches}
            onFillSuggest={fillSuggest}
          />
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-800 flex items-center gap-2">
        <button className="text-slate-500 hover:text-slate-300 transition-colors text-base">⚙️</button>
        <span className="text-slate-500 text-xs">{totalInDb} leads in database</span>
      </div>
    </aside>
  )
}

// ─── Leads sidebar ────────────────────────────────────────────────────────────

interface LeadsSidebarProps {
  search: string
  setSearch: (s: string) => void
  activeCategory: string
  setActiveCategory: (c: string) => void
  sortedCategories: [string, number][]
  totalLeads: number
  pipeline: { new: number; website: number; called: number; converted: number }
}

function LeadsSidebarContent({
  search, setSearch, activeCategory, setActiveCategory,
  sortedCategories, totalLeads, pipeline,
}: LeadsSidebarProps) {
  return (
    <div className="flex flex-col gap-3 pt-2">
      {/* Search */}
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
        <input
          type="text"
          placeholder="Search leads..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-800/80 border border-slate-700/60 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
        />
      </div>

      {/* Category list */}
      <div className="flex flex-col gap-0.5">
        <CategoryRow
          emoji="📋"
          label="All"
          count={totalLeads}
          active={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
        />
        {sortedCategories.map(([query, count]) => {
          const info = QUERY_DISPLAY[query] ?? { emoji: '📍', label: query }
          return (
            <CategoryRow
              key={query}
              emoji={info.emoji}
              label={info.label}
              count={count}
              active={activeCategory === query}
              onClick={() => setActiveCategory(query)}
            />
          )
        })}
      </div>

      {/* Pipeline counters */}
      <div className="border-t border-slate-800 pt-3 mt-1">
        <div className="text-slate-600 text-[10px] font-mono uppercase tracking-wider mb-2">Pipeline</div>
        <div className="grid grid-cols-2 gap-1.5">
          <PipelineCounter icon="🆕" label="New" count={pipeline.new} color={STATUS_CONFIG.NEW.color} />
          <PipelineCounter icon="🌐" label="Website" count={pipeline.website} color={STATUS_CONFIG.WEBSITE_READY.color} />
          <PipelineCounter icon="📞" label="Called" count={pipeline.called} color={STATUS_CONFIG.CALLED.color} />
          <PipelineCounter icon="✅" label="Converted" count={pipeline.converted} color={STATUS_CONFIG.CONVERTED.color} />
        </div>
      </div>
    </div>
  )
}

function CategoryRow({
  emoji, label, count, active, onClick,
}: {
  emoji: string; label: string; count: number; active: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs w-full text-left transition-all border-l-2 ${
        active
          ? 'text-accent border-accent bg-accent/5'
          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
      } ${label === 'All' ? 'font-semibold' : ''}`}
    >
      <span>{emoji}</span>
      <span className="flex-1 truncate">{label}</span>
      <span className={`text-[10px] tabular-nums ${active ? 'text-accent/70' : 'text-slate-600'}`}>
        {count}
      </span>
    </button>
  )
}

function PipelineCounter({
  icon, label, count, color,
}: {
  icon: string; label: string; count: number; color: string
}) {
  return (
    <div className="bg-slate-800/40 rounded-md px-2 py-1.5 flex items-center gap-1.5">
      <span className="text-xs">{icon}</span>
      <div>
        <div className="text-xs font-bold tabular-nums" style={{ color }}>{count}</div>
        <div className="text-[10px] text-slate-600">{label}</div>
      </div>
    </div>
  )
}

// ─── Discover sidebar ─────────────────────────────────────────────────────────

interface DiscoverSidebarProps {
  discQuery: string
  setDiscQuery: (s: string) => void
  discLocation: string
  setDiscLocation: (s: string) => void
  discMax: string
  setDiscMax: (s: string) => void
  onSubmit: (e: React.FormEvent) => void
  recentSearches: RecentSearch[]
  onFillSuggest: (q: string, l: string) => void
}

function DiscoverSidebarContent({
  discQuery, setDiscQuery, discLocation, setDiscLocation,
  discMax, setDiscMax, onSubmit, recentSearches, onFillSuggest,
}: DiscoverSidebarProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 pt-2">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Business type</label>
        <input
          type="text"
          placeholder="e.g. plumber"
          value={discQuery}
          onChange={(e) => setDiscQuery(e.target.value)}
          className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Location</label>
        <input
          type="text"
          placeholder="e.g. Gallup, NM"
          value={discLocation}
          onChange={(e) => setDiscLocation(e.target.value)}
          className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Max results</label>
        <input
          type="number"
          value={discMax}
          onChange={(e) => setDiscMax(e.target.value)}
          min="1"
          max="100"
          className="bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/20 transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={!discQuery || !discLocation}
        className="flex items-center justify-center gap-2 bg-accent text-slate-950 font-bold text-xs py-2.5 px-4 rounded-lg hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
      >
        🔍 Search Google Maps
      </button>

      {recentSearches.length > 0 && (
        <div className="mt-1">
          <div className="text-[10px] text-slate-600 font-mono uppercase tracking-wider mb-2">Recent</div>
          <div className="flex flex-col gap-1">
            {recentSearches.slice(0, 5).map((rs, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onFillSuggest(rs.query, rs.location)}
                className="text-left text-[10px] text-slate-400 hover:text-accent bg-slate-800/50 hover:bg-slate-800 rounded px-2 py-1 transition-all truncate"
              >
                {rs.query} · {rs.location}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  )
}
