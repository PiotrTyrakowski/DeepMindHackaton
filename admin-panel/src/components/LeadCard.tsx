import type { EnrichedLead } from '../types'
import { STATUS_CONFIG, PRIORITY_CONFIG, formatTime } from '../utils/leadUtils'

interface Props {
  lead: EnrichedLead
  onClick: () => void
  onCall: (e: React.MouseEvent) => void
  /** dashed border for discover results not yet imported */
  dashed?: boolean
  imported?: boolean
  onImport?: (e: React.MouseEvent) => void
  onSkip?: (e: React.MouseEvent) => void
}

export default function LeadCard({ lead, onClick, onCall, dashed, imported, onImport, onSkip }: Props) {
  const status = STATUS_CONFIG[lead.status]
  const priority = PRIORITY_CONFIG[lead.priority]

  const topServices = lead.services.slice(0, 2)
  const extraServices = lead.services.length - 2

  // Score bar width — we flip the gradient direction so green=high, red=low
  const scorePercent = lead.score
  const scoreBarPosition = `${100 - scorePercent}%` // offset into the gradient

  return (
    <div
      className={`lead-card relative bg-slate-900 rounded-xl overflow-hidden cursor-pointer group ${
        dashed ? 'border border-dashed border-slate-700' : 'border border-slate-800'
      } hover:border-slate-600 hover:shadow-lg hover:shadow-black/40`}
      style={{ borderLeft: `3px solid ${status.borderColor}` }}
      onClick={onClick}
    >
      {/* Imported overlay */}
      {imported && (
        <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center z-10 rounded-xl">
          <div className="text-3xl">✓</div>
          <div className="text-accent font-semibold text-sm mt-1">Imported</div>
        </div>
      )}

      <div className="p-4">
        {/* Header row: emoji + name + no-website dot */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-lg flex-shrink-0">{lead.emoji}</span>
            <h3 className="font-semibold text-slate-100 text-sm leading-tight truncate group-hover:text-white transition-colors">
              {lead.name}
            </h3>
          </div>
          {/* No website indicator */}
          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500 mt-1" title="No website" />
        </div>

        {/* Category + location */}
        <div className="text-slate-400 text-xs mb-0.5 truncate">{lead.apify_category ? JSON.parse(lead.apify_category)[0] ?? lead.query : lead.query}</div>
        <div className="text-slate-500 text-xs mb-3">
          📍 {lead.city}{lead.state ? `, ${lead.state}` : ''}
        </div>

        {/* Rating + phone */}
        <div className="flex items-center gap-3 mb-3">
          {lead.rating !== null ? (
            <span className="text-xs flex items-center gap-1">
              <span className="text-yellow-400">★</span>
              <span className="text-slate-300 font-medium">{lead.rating.toFixed(1)}</span>
              {lead.reviews_count && (
                <span className="text-slate-600">({lead.reviews_count})</span>
              )}
            </span>
          ) : (
            <span className="text-slate-600 text-xs">No rating</span>
          )}
          {lead.phone ? (
            <span className="text-xs text-emerald-400/80 flex items-center gap-1 truncate min-w-0">
              <span>📞</span>
              <span className="truncate">{lead.phone}</span>
            </span>
          ) : (
            <span className="text-slate-600 text-xs">No phone</span>
          )}
        </div>

        {/* Score bar */}
        <div className="mb-2">
          <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${scorePercent}%`,
                background: `linear-gradient(90deg, #00ff88 0%, #facc15 50%, #ef4444 100%)`,
                backgroundSize: `${10000 / scorePercent}% 100%`,
                backgroundPosition: scoreBarPosition,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-slate-500 tabular-nums">Score: {lead.score}/100</span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{ color: priority.color, background: priority.bg }}
            >
              {priority.icon} {priority.label}
            </span>
          </div>
        </div>

        {/* AI insight */}
        <p className="text-slate-400 text-xs italic leading-relaxed mb-3 line-clamp-2">
          "{lead.ai_insight}"
        </p>

        {/* Services chips */}
        {lead.services.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {topServices.map((s) => (
              <span
                key={s}
                className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded"
              >
                {s}
              </span>
            ))}
            {extraServices > 0 && (
              <span className="text-[10px] text-slate-500 px-1 py-0.5">+{extraServices}</span>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {dashed ? (
            <>
              <button
                onClick={onImport}
                className="flex-1 py-1.5 bg-accent/10 border border-accent/40 text-accent text-xs font-medium rounded-lg hover:bg-accent/20 transition-all"
              >
                ✓ Import
              </button>
              <button
                onClick={onSkip}
                className="flex-1 py-1.5 bg-slate-800/50 border border-slate-700 text-slate-500 text-xs font-medium rounded-lg hover:text-slate-300 hover:bg-slate-800 transition-all"
              >
                Skip
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onCall}
                disabled={!lead.phone}
                className="flex items-center justify-center gap-1.5 flex-1 py-1.5 bg-accent text-slate-950 text-xs font-bold rounded-lg hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                📞 Call
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onClick() }}
                className="flex items-center justify-center gap-1 flex-1 py-1.5 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg hover:border-slate-500 hover:text-white transition-all"
              >
                Details →
              </button>
            </>
          )}
        </div>

        {/* Footer: status + time */}
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-800">
          <span className="text-[10px]">{status.dot}</span>
          <span className="text-[10px]" style={{ color: status.color }}>{status.label}</span>
          <span className="text-slate-700 text-[10px]">·</span>
          <span className="text-slate-600 text-[10px]">Added {formatTime(lead.scraped_at)}</span>
        </div>
      </div>
    </div>
  )
}
