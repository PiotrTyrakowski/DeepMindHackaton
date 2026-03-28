import { useState } from 'react'
import type { EnrichedLead, LeadStatus } from '../types'
import { STATUS_CONFIG, PRIORITY_CONFIG, formatTime } from '../utils/leadUtils'

interface Props {
  lead: EnrichedLead
  onClose: () => void
  onStatusChange: (id: number, status: LeadStatus) => void
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void
}

const ALL_STATUSES: LeadStatus[] = [
  'NEW', 'RESEARCHED', 'WEBSITE_READY', 'SMS_SENT',
  'CALLED', 'INTERESTED', 'NOT_INTERESTED', 'CONVERTED',
]

// Status progression order
const STATUS_ORDER: Record<LeadStatus, number> = {
  NEW: 0, RESEARCHED: 1, WEBSITE_READY: 2,
  SMS_SENT: 3, CALLED: 4, INTERESTED: 5,
  NOT_INTERESTED: 5, CONVERTED: 6,
}

export default function DetailPanel({ lead, onClose, onStatusChange, onToast }: Props) {
  const [pipelineRunning, setPipelineRunning] = useState(false)
  const [pipelineStep, setPipelineStep] = useState<string | null>(null)

  const statusOrder = STATUS_ORDER[lead.status]
  const canGenerateWebsite = statusOrder <= 1
  const canSendSms = statusOrder >= 2
  const canCall = !!lead.phone

  const statusCfg = STATUS_CONFIG[lead.status]
  const priorityCfg = PRIORITY_CONFIG[lead.priority]

  const scoreBreakdown = [
    { label: 'No website', points: '+40' },
    { label: 'Has categories', points: lead.apify_category ? '+15' : '+0' },
    { label: 'Has phone', points: lead.phone ? '+15' : '+0' },
    { label: 'Rating bonus', points: lead.rating ? `+${Math.round((lead.rating / 5) * 12)}` : '+0' },
  ]

  // Timeline events
  const timeline = [
    { done: true, label: 'Lead scraped from Google Maps', time: lead.scraped_at },
    { done: statusOrder >= 1, label: 'AI insight generated', time: statusOrder >= 1 ? lead.scraped_at : null },
    { done: statusOrder >= 2, label: 'Website generated', time: null },
    { done: statusOrder >= 3, label: 'SMS sent', time: null },
    { done: statusOrder >= 4, label: 'Call completed', time: null },
  ]

  async function runPipeline() {
    if (pipelineRunning) return
    setPipelineRunning(true)
    const steps = ['Generating website…', 'Website ready — waiting 5s…', 'Sending SMS…', 'Initiating call…']
    const statuses: LeadStatus[] = ['WEBSITE_READY', 'WEBSITE_READY', 'SMS_SENT', 'CALLED']
    for (let i = 0; i < steps.length; i++) {
      setPipelineStep(steps[i])
      await sleep(i === 1 ? 5000 : 2500)
      onStatusChange(lead.id, statuses[i])
    }
    setPipelineStep(null)
    setPipelineRunning(false)
    onToast('Pipeline completed!', 'success')
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-30 detail-overlay"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed right-0 top-0 h-full w-[420px] z-40 flex flex-col bg-slate-900 border-l border-slate-800 animate-slide-in-right shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 text-lg z-10 w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-800 transition-all"
        >
          ✕
        </button>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-800 pr-12">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{lead.emoji}</span>
            <h2 className="text-slate-100 font-semibold text-base leading-tight">{lead.name}</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 flex-wrap">
            <span className="capitalize">{lead.query}</span>
            <span>·</span>
            <span>{lead.city}{lead.state ? `, ${lead.state}` : ''}</span>
            {lead.rating && (
              <>
                <span>·</span>
                <span className="flex items-center gap-0.5">
                  <span className="text-yellow-400">★</span>
                  <span>{lead.rating.toFixed(1)}</span>
                </span>
              </>
            )}
            {lead.google_maps_url && (
              <>
                <span>·</span>
                <a
                  href={lead.google_maps_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent/80 hover:text-accent"
                  onClick={(e) => e.stopPropagation()}
                >
                  Google Maps ↗
                </a>
              </>
            )}
          </div>

          {/* Status dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            <select
              value={lead.status}
              onChange={(e) => onStatusChange(lead.id, e.target.value as LeadStatus)}
              className="text-xs font-medium px-2 py-1 rounded-md border focus:outline-none focus:ring-1 focus:ring-accent/30 cursor-pointer bg-slate-800"
              style={{ color: statusCfg.color, borderColor: statusCfg.color + '40' }}
            >
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s} style={{ color: STATUS_CONFIG[s].color }}>
                  {STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sticky action buttons */}
        <div className="px-5 py-3 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <ActionBtn
              icon="🚀"
              label="Generate Website"
              disabled={!canGenerateWebsite}
              onClick={() => {
                onStatusChange(lead.id, 'WEBSITE_READY')
                onToast('Website generated!', 'success')
              }}
            />
            <ActionBtn
              icon="📱"
              label="Send SMS"
              disabled={!canSendSms}
              onClick={() => {
                onStatusChange(lead.id, 'SMS_SENT')
                onToast('SMS sent!', 'success')
              }}
            />
            <ActionBtn
              icon="📞"
              label="Call"
              disabled={!canCall}
              onClick={() => {
                onStatusChange(lead.id, 'CALLED')
                onToast(`Calling ${lead.phone}…`, 'info')
              }}
            />
          </div>
          <button
            onClick={runPipeline}
            disabled={pipelineRunning}
            className="w-full flex items-center justify-center gap-2 py-2 bg-accent/10 border border-accent/30 text-accent text-xs font-bold rounded-lg hover:bg-accent/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {pipelineRunning ? (
              <>
                <span className="animate-pulse-scan">⚡</span>
                {pipelineStep}
              </>
            ) : (
              '▶ Run Full Pipeline'
            )}
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* AI Research Summary */}
          <Section title="AI Research Summary">
            <p className="text-slate-300 text-xs leading-relaxed">{lead.ai_insight}</p>
          </Section>

          {/* Contact Intelligence */}
          <Section title="Contact Intelligence">
            <div className="space-y-2">
              <ContactRow icon="📞" label="Phone" value={lead.phone} ok={!!lead.phone} />
              <ContactRow icon="✉️" label="Email" value={lead.email} ok={!!lead.email} />
              <ContactRow icon="🌐" label="Website" value={null} ok={false} />
              {lead.facebook && <ContactRow icon="👤" label="Facebook" value="Found" ok={true} />}
              {lead.instagram && <ContactRow icon="📷" label="Instagram" value="Found" ok={true} />}
            </div>
          </Section>

          {/* Services */}
          {lead.services.length > 0 && (
            <Section title="Services Detected">
              <div className="flex flex-wrap gap-1.5">
                {lead.services.map((s) => (
                  <span
                    key={s}
                    className="text-[11px] bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Location */}
          <Section title="Location">
            <div className="space-y-2">
              <div className="text-slate-300 text-xs mb-2">
                📍 {lead.address || lead.location}
              </div>
              <ConfidenceBar label={lead.city} pct={90} />
              {lead.state && <ConfidenceBar label={lead.state} pct={82} />}
              <ConfidenceBar label="Region confirmed" pct={76} />
            </div>
          </Section>

          {/* Opportunity Score */}
          <Section title="Opportunity Score">
            <div className="text-center mb-3">
              <div className="text-3xl font-bold tabular-nums" style={{ color: priorityCfg.color }}>
                {lead.score}
                <span className="text-slate-500 text-lg font-normal"> / 100</span>
              </div>
              <div
                className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded mt-1"
                style={{ color: priorityCfg.color, background: priorityCfg.bg }}
              >
                {priorityCfg.icon} {priorityCfg.label}
              </div>
            </div>
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${lead.score}%`,
                  background: 'linear-gradient(90deg, #00ff88, #facc15)',
                }}
              />
            </div>
            <div className="space-y-1.5">
              {scoreBreakdown.map((row) => (
                <div key={row.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{row.label}</span>
                  <span className={row.points.startsWith('+0') ? 'text-slate-600' : 'text-accent'}>
                    {row.points}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* Business Hours */}
          <Section title="Business Hours">
            <div className="space-y-1">
              {[
                ['Mon–Fri', '8:00 AM – 6:00 PM'],
                ['Saturday', 'Closed'],
                ['Sunday', '—'],
              ].map(([day, hours]) => (
                <div key={day} className="flex justify-between text-xs">
                  <span className="text-slate-400">{day}</span>
                  <span className={hours === 'Closed' ? 'text-red-400/70' : hours === '—' ? 'text-slate-600' : 'text-slate-300'}>
                    {hours}
                  </span>
                </div>
              ))}
            </div>
          </Section>

          {/* Timeline */}
          <Section title="Timeline">
            <div className="space-y-3">
              {timeline.map((event, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 mt-0.5 ${
                        event.done
                          ? 'bg-accent border-accent'
                          : 'bg-transparent border-slate-700'
                      }`}
                    />
                    {i < timeline.length - 1 && (
                      <div className={`w-px flex-1 mt-1 ${event.done ? 'bg-accent/30' : 'bg-slate-800'}`} style={{ minHeight: 16 }} />
                    )}
                  </div>
                  <div className="pb-2">
                    <div className={`text-xs ${event.done ? 'text-slate-300' : 'text-slate-600'}`}>
                      {event.label}
                    </div>
                    {event.time && (
                      <div className="text-[10px] text-slate-600 mt-0.5">{formatTime(event.time)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </aside>
    </>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
      <h4 className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">{title}</h4>
      {children}
    </div>
  )
}

function ActionBtn({
  icon, label, disabled, onClick,
}: {
  icon: string; label: string; disabled: boolean; onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? 'Complete previous steps first' : label}
      className="flex flex-col items-center justify-center gap-1 py-2 px-1 bg-slate-800/60 border border-slate-700 rounded-lg text-[10px] text-slate-300 hover:border-slate-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
    >
      <span className="text-base">{icon}</span>
      <span className="text-center leading-tight">{label}</span>
    </button>
  )
}

function ContactRow({
  icon, label, value, ok,
}: {
  icon: string; label: string; value: string | null; ok: boolean
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span>{icon}</span>
      <span className="text-slate-500 w-16">{label}</span>
      <span className={`flex-1 ${ok ? 'text-slate-200' : 'text-slate-600'}`}>
        {value ?? 'Not found'}
      </span>
      <span>{ok ? '✅' : '❌'}</span>
    </div>
  )
}

function ConfidenceBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-slate-400 w-28 truncate">{label}</span>
      <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-accent/60"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-slate-500 w-8 text-right">{pct}%</span>
    </div>
  )
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
