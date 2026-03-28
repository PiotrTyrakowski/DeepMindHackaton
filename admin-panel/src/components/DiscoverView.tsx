import { useEffect, useRef, useState } from 'react'
import type { EnrichedLead } from '../types'
import LeadCard from './LeadCard'

interface Props {
  state: 'idle' | 'scanning' | 'results'
  scanLog: string[]
  scanProgress: number
  results: EnrichedLead[]
  importedIds: Set<number>
  onImportOne: (lead: EnrichedLead) => void
  onSkipOne: (id: number) => void
  onImportAll: () => void
  onFillSuggest: (query: string, location: string) => void
  currentQuery: string
  currentLocation: string
}

const SUGGESTED = [
  { query: 'plumber', location: 'Gallup, NM', emoji: '🔧' },
  { query: 'electrician', location: 'Tooele, UT', emoji: '⚡' },
  { query: 'roofing', location: 'Hobbs, NM', emoji: '🏠' },
  { query: 'hair salon', location: 'Stillwater, OK', emoji: '💇' },
]

export default function DiscoverView({
  state, scanLog, scanProgress, results, importedIds,
  onImportOne, onSkipOne, onImportAll, onFillSuggest,
  currentQuery, currentLocation,
}: Props) {
  const logEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [scanLog])

  const notImported = results.filter((r) => !importedIds.has(r.id))
  const importedCount = importedIds.size

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-slate-800">
        <h2 className="text-xl font-semibold text-slate-100">Discover New Leads</h2>
        <p className="text-slate-500 text-sm mt-1">Search Google Maps for businesses without websites</p>
      </div>

      <div className="flex-1 px-6 py-6">
        {state === 'idle' && (
          <IdleState onFillSuggest={onFillSuggest} />
        )}

        {state === 'scanning' && (
          <ScanningState
            log={scanLog}
            progress={scanProgress}
            query={currentQuery}
            location={currentLocation}
            logEndRef={logEndRef}
          />
        )}

        {state === 'results' && (
          <ResultsState
            results={results}
            importedIds={importedIds}
            importedCount={importedCount}
            onImportOne={onImportOne}
            onSkipOne={onSkipOne}
            onImportAll={onImportAll}
          />
        )}
      </div>
    </div>
  )
}

// ─── Idle state ───────────────────────────────────────────────────────────────

function IdleState({ onFillSuggest }: { onFillSuggest: (q: string, l: string) => void }) {
  return (
    <div className="flex flex-col items-center">
      {/* USA Map SVG */}
      <div className="w-full max-w-2xl mx-auto mb-8">
        <USAMapSVG />
      </div>

      <p className="text-slate-400 text-sm mb-6 text-center">
        Enter a business type and location in the sidebar to start scanning
      </p>

      <div className="flex flex-wrap gap-2 justify-center">
        {SUGGESTED.map((s) => (
          <button
            key={s.query + s.location}
            onClick={() => onFillSuggest(s.query, s.location)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-full text-xs text-slate-300 hover:border-accent/50 hover:text-accent hover:bg-accent/5 transition-all"
          >
            <span>{s.emoji}</span>
            <span>{s.query} in {s.location}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Scanning state ───────────────────────────────────────────────────────────

function ScanningState({
  log, progress, query, location, logEndRef,
}: {
  log: string[]
  progress: number
  query: string
  location: string
  logEndRef: React.RefObject<HTMLDivElement>
}) {
  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-4xl mb-3 animate-pulse-scan">🔍</div>
        <h3 className="text-slate-200 font-semibold text-lg">
          Scanning for {query}s in {location}
        </h3>
        <p className="text-slate-500 text-sm mt-1">This may take up to 5 minutes…</p>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #00ff88, #00cc6a)',
            }}
          />
        </div>
      </div>

      {/* Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2 min-h-[120px]">
        {log.map((line, i) => (
          <div key={i} className="scan-line flex items-start gap-2 text-slate-300">
            <span className="text-accent">▶</span>
            <span>{line}</span>
          </div>
        ))}
        {log.length > 0 && (
          <div className="flex items-center gap-1 text-slate-600">
            <span className="cursor-blink">█</span>
          </div>
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}

// ─── Results state ────────────────────────────────────────────────────────────

function ResultsState({
  results, importedIds, importedCount, onImportOne, onSkipOne, onImportAll,
}: {
  results: EnrichedLead[]
  importedIds: Set<number>
  importedCount: number
  onImportOne: (l: EnrichedLead) => void
  onSkipOne: (id: number) => void
  onImportAll: () => void
}) {
  const notSkipped = results.filter((r) => importedIds.has(r.id) || !importedIds.has(r.id))
  const remaining = results.filter((r) => !importedIds.has(r.id)).length

  return (
    <div>
      {/* Import all banner */}
      <div className="flex items-center justify-between mb-5 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
        <div className="text-slate-300 text-sm">
          Found <span className="text-accent font-bold">{results.length}</span> leads ·{' '}
          <span className="text-slate-500">{importedCount} imported</span>
        </div>
        {remaining > 0 && (
          <button
            onClick={onImportAll}
            className="flex items-center gap-2 bg-accent text-slate-950 font-bold text-sm px-4 py-2 rounded-lg hover:bg-accent/90 transition-all"
          >
            ✓ Import All ({remaining})
          </button>
        )}
        {remaining === 0 && (
          <span className="text-emerald-400 text-sm font-medium">All imported ✓</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {results.map((lead) => {
          const isImported = importedIds.has(lead.id)
          return (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={() => {}}
              onCall={(e) => e.stopPropagation()}
              dashed={!isImported}
              imported={isImported}
              onImport={(e) => { e.stopPropagation(); onImportOne(lead) }}
              onSkip={(e) => { e.stopPropagation(); onSkipOne(lead.id) }}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── USA Map SVG ──────────────────────────────────────────────────────────────

function USAMapSVG() {
  return (
    <svg
      viewBox="0 0 960 600"
      className="w-full opacity-30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Simplified USA outline */}
      <path
        d="M 140 100 L 800 100 L 850 150 L 870 200 L 860 280 L 820 350 L 780 400 L 720 430 L 680 480 L 600 490 L 520 480 L 460 500 L 400 490 L 340 480 L 280 460 L 220 440 L 170 400 L 140 360 L 120 300 L 110 240 L 120 180 L 140 100 Z"
        stroke="#00ff88"
        strokeWidth="1.5"
        fill="rgba(0,255,136,0.03)"
        strokeLinejoin="round"
      />
      {/* Alaska hint */}
      <path
        d="M 80 480 L 120 460 L 160 480 L 170 520 L 130 530 L 90 520 Z"
        stroke="#00ff88"
        strokeWidth="1"
        fill="rgba(0,255,136,0.03)"
      />
      {/* Hawaii hint */}
      <ellipse cx="200" cy="540" rx="25" ry="12" stroke="#00ff88" strokeWidth="1" fill="rgba(0,255,136,0.03)" />
      {/* Grid lines */}
      {[150, 200, 250, 300, 350, 400, 450].map((y) => (
        <line key={y} x1="100" y1={y} x2="880" y2={y} stroke="#00ff88" strokeWidth="0.3" strokeOpacity="0.3" />
      ))}
      {[200, 300, 400, 500, 600, 700, 800].map((x) => (
        <line key={x} x1={x} y1="80" x2={x} y2="520" stroke="#00ff88" strokeWidth="0.3" strokeOpacity="0.3" />
      ))}
      {/* Dots for key cities */}
      {[
        [350, 290], [580, 320], [720, 250], [200, 280], [450, 400],
        [630, 420], [390, 180], [760, 350], [310, 350],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="#00ff88" fillOpacity="0.5" />
      ))}
      {/* Scan animation lines */}
      <line x1="100" y1="300" x2="880" y2="300" stroke="#00ff88" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 8" />
    </svg>
  )
}
