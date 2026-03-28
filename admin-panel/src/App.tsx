import { useCallback, useEffect, useRef, useState } from 'react'
import type { ActiveTab, DiscoverState, EnrichedLead, Lead, LeadStatus, RecentSearch, Toast } from './types'
import { enrichLead } from './utils/leadUtils'
import { getLeads, healthCheck, scrapeSingle, updateLeadStatus } from './api/client'
import { MOCK_LEADS, MOCK_DISCOVER_LEADS } from './data/mockData'
import Sidebar from './components/Sidebar'
import LeadsView from './components/LeadsView'
import DiscoverView from './components/DiscoverView'
import DetailPanel from './components/DetailPanel'
import ToastContainer from './components/Toast'

let toastId = 0

export default function App() {
  const [leads, setLeads] = useState<EnrichedLead[]>([])
  const [loading, setLoading] = useState(true)
  const [backendAvailable, setBackendAvailable] = useState(false)

  const [activeTab, setActiveTab] = useState<ActiveTab>('leads')
  const [selectedLead, setSelectedLead] = useState<EnrichedLead | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const [discoverState, setDiscoverState] = useState<DiscoverState>('idle')
  const [discoverResults, setDiscoverResults] = useState<EnrichedLead[]>([])
  const [discoverImported, setDiscoverImported] = useState<Set<number>>(new Set())
  const [scanLog, setScanLog] = useState<string[]>([])
  const [scanProgress, setScanProgress] = useState(0)
  const [currentQuery, setCurrentQuery] = useState('')
  const [currentLocation, setCurrentLocation] = useState('')

  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [toasts, setToasts] = useState<Toast[]>([])

  const scanTimeouts = useRef<ReturnType<typeof setTimeout>[]>([])

  // ─── Init ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    async function init() {
      const ok = await healthCheck()
      setBackendAvailable(ok)
      if (ok) {
        try {
          const { leads: raw } = await getLeads()
          setLeads(raw.map(enrichLead))
        } catch {
          setLeads(MOCK_LEADS.map(enrichLead))
        }
      } else {
        setLeads(MOCK_LEADS.map(enrichLead))
      }
      setLoading(false)
    }
    init()
  }, [])

  // ─── Toast helpers ─────────────────────────────────────────────────────────

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  const dismissToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))

  // ─── Lead status update ───────────────────────────────────────────────────

  const handleStatusChange = useCallback(async (id: number, status: LeadStatus) => {
    setLeads((prev) =>
      prev.map((l) => l.id === id ? enrichLead({ ...l, status }) : l)
    )
    if (selectedLead?.id === id) {
      setSelectedLead((prev) => prev ? enrichLead({ ...prev, status }) : null)
    }
    if (backendAvailable) {
      try {
        await updateLeadStatus(id, status)
      } catch {
        // silent — state already updated optimistically
      }
    }
  }, [backendAvailable, selectedLead])

  // ─── Call confirmation ────────────────────────────────────────────────────

  const handleCall = useCallback((lead: EnrichedLead) => {
    if (!lead.phone) return
    const confirmed = window.confirm(`Call ${lead.name}?\n${lead.phone}`)
    if (confirmed) {
      handleStatusChange(lead.id, 'CALLED')
      addToast(`Calling ${lead.phone}…`, 'info')
    }
  }, [handleStatusChange, addToast])

  // ─── Discover ─────────────────────────────────────────────────────────────

  const handleDiscover = useCallback(async (query: string, location: string, maxResults: number) => {
    // Clear previous scan
    scanTimeouts.current.forEach(clearTimeout)
    setScanLog([])
    setScanProgress(0)
    setDiscoverState('scanning')
    setDiscoverImported(new Set())
    setCurrentQuery(query)
    setCurrentLocation(location)
    setActiveTab('discover')

    // Save to recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter((r) => !(r.query === query && r.location === location))
      return [{ query, location }, ...filtered].slice(0, 5)
    })

    const log = (msg: string, delay: number) => {
      const t = setTimeout(() => setScanLog((prev) => [...prev, msg]), delay)
      scanTimeouts.current.push(t)
    }
    const progress = (pct: number, delay: number) => {
      const t = setTimeout(() => setScanProgress(pct), delay)
      scanTimeouts.current.push(t)
    }

    log(`Scanning Google Maps for ${query}s in ${location}…`, 400)
    progress(15, 600)

    if (backendAvailable) {
      // Real scrape
      try {
        log(`Connecting to Apify actor…`, 1200)
        progress(30, 1400)
        const result = await scrapeSingle({ query, location, max_results: maxResults })
        log(`Found ${result.total_scraped} businesses…`, 100)
        progress(70, 200)
        log(`Filtering: no website…`, 600)
        progress(90, 800)
        log(`${result.saved_to_db} new leads saved to database`, 1500)
        progress(100, 1700)

        // Refresh leads
        const t = setTimeout(async () => {
          try {
            const { leads: raw } = await getLeads()
            const enriched = raw.map(enrichLead)
            setLeads(enriched)
            // Show newly added leads as discover results
            const newLeads = enriched.filter((l) =>
              !leads.some((existing) => existing.id === l.id)
            )
            setDiscoverResults(newLeads.length > 0 ? newLeads : enriched.slice(-5))
          } catch {
            setDiscoverResults(MOCK_DISCOVER_LEADS.map(enrichLead))
          }
          setDiscoverState('results')
        }, 2000)
        scanTimeouts.current.push(t)
      } catch (err) {
        log(`Backend error — showing demo results`, 500)
        progress(100, 700)
        const t = setTimeout(() => {
          setDiscoverResults(MOCK_DISCOVER_LEADS.map(enrichLead))
          setDiscoverState('results')
        }, 1000)
        scanTimeouts.current.push(t)
      }
    } else {
      // Simulate
      log(`Found 23 businesses…`, 1800)
      progress(50, 2000)
      log(`Filtering: no website…`, 3200)
      progress(80, 3400)
      log(`${MOCK_DISCOVER_LEADS.length} leads ready to import`, 4500)
      progress(100, 4700)
      const t = setTimeout(() => {
        setDiscoverResults(MOCK_DISCOVER_LEADS.map(enrichLead))
        setDiscoverState('results')
      }, 5200)
      scanTimeouts.current.push(t)
    }
  }, [backendAvailable, leads])

  // ─── Import ───────────────────────────────────────────────────────────────

  const handleImportOne = useCallback((lead: EnrichedLead) => {
    setDiscoverImported((prev) => new Set([...prev, lead.id]))
    setLeads((prev) => {
      if (prev.some((l) => l.id === lead.id)) return prev
      return [...prev, lead]
    })
    addToast(`${lead.name} imported`, 'success')
  }, [addToast])

  const handleSkipOne = useCallback((id: number) => {
    setDiscoverImported((prev) => new Set([...prev, -id])) // negative id marks as skipped
  }, [])

  const handleImportAll = useCallback(() => {
    const toImport = discoverResults.filter((r) => !discoverImported.has(r.id))
    const ids = new Set(toImport.map((r) => r.id))
    setDiscoverImported((prev) => new Set([...prev, ...ids]))
    setLeads((prev) => {
      const existing = new Set(prev.map((l) => l.id))
      const newOnes = toImport.filter((r) => !existing.has(r.id))
      return [...prev, ...newOnes]
    })
    addToast(`${toImport.length} leads imported → Leads tab`, 'success')
    setTimeout(() => setActiveTab('leads'), 2000)
  }, [discoverResults, discoverImported, addToast])

  // ─── Render ────────────────────────────────────────────────────────────────

  const panelOpen = selectedLead !== null

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        search={search}
        setSearch={setSearch}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        leads={leads}
        totalInDb={leads.length}
        recentSearches={recentSearches}
        onDiscover={handleDiscover}
      />

      {/* Main content */}
      <main
        className="flex-1 overflow-hidden flex flex-col transition-all duration-300"
        style={{
          marginLeft: '240px',
          marginRight: panelOpen ? '420px' : '0',
        }}
      >
        {loading ? (
          <LoadingScreen />
        ) : activeTab === 'leads' ? (
          <LeadsView
            leads={leads}
            search={search}
            activeCategory={activeCategory}
            onSelectLead={(l) => setSelectedLead(l)}
            onCall={handleCall}
            onGoDiscover={() => setActiveTab('discover')}
          />
        ) : (
          <DiscoverView
            state={discoverState}
            scanLog={scanLog}
            scanProgress={scanProgress}
            results={discoverResults}
            importedIds={discoverImported}
            onImportOne={handleImportOne}
            onSkipOne={handleSkipOne}
            onImportAll={handleImportAll}
            onFillSuggest={(q, l) => handleDiscover(q, l, 30)}
            currentQuery={currentQuery}
            currentLocation={currentLocation}
          />
        )}

        {/* Backend status indicator */}
        {!backendAvailable && !loading && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-full px-3 py-1 text-[10px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
            Demo mode — backend offline
          </div>
        )}
      </main>

      {/* Detail panel */}
      {selectedLead && (
        <DetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={handleStatusChange}
          onToast={addToast}
        />
      )}

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="text-4xl animate-pulse-scan">⚡</div>
      <div className="font-jetbrains text-accent text-sm tracking-widest">LOADING LEADS…</div>
    </div>
  )
}
