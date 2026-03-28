import type { Toast as ToastType } from '../types'

interface Props {
  toasts: ToastType[]
  onDismiss: (id: number) => void
}

const ICONS: Record<string, string> = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
}

const COLORS: Record<string, string> = {
  success: 'border-emerald-500/40 bg-emerald-500/10',
  error: 'border-red-500/40 bg-red-500/10',
  info: 'border-blue-500/40 bg-blue-500/10',
}

export default function Toast({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-enter flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-medium text-slate-100 shadow-xl cursor-pointer max-w-sm ${COLORS[t.type]}`}
          onClick={() => onDismiss(t.id)}
        >
          <span>{ICONS[t.type]}</span>
          <span className="flex-1">{t.message}</span>
          <button className="text-slate-400 hover:text-slate-200 text-xs ml-2">✕</button>
        </div>
      ))}
    </div>
  )
}
