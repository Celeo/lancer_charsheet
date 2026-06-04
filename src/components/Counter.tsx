import { useState } from 'preact/hooks'

interface CounterProps {
  label: string
  value: number
  max: number
  min?: number
  onChange: (v: number) => void
  progressClass?: string  // daisyUI progress color class
  warn?: boolean          // show warning color on bar when high
}

export function Counter({
  label,
  value,
  max,
  min = 0,
  onChange,
  progressClass = 'progress-primary',
  warn = false,
}: CounterProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const clamp = (v: number) => Math.max(min, Math.min(max, v))

  const pct = max > 0 ? value / max : 0
  const warnActive = warn && pct > 0.75
  const barClass = warnActive ? 'progress-warning' : progressClass

  function commitEdit() {
    const n = parseInt(draft, 10)
    if (!isNaN(n)) onChange(clamp(n))
    setEditing(false)
  }

  return (
    <div class="mb-3">
      <div class="flex items-center justify-between mb-1">
        <span class="section-label">{label}</span>
        {editing ? (
          <input
            type="number"
            value={draft}
            autofocus
            class="input input-xs w-16 text-right font-mono text-sm"
            onInput={(e) => setDraft((e.target as HTMLInputElement).value)}
            onBlur={commitEdit}
            onKeyDown={(e) => e.key === 'Enter' && commitEdit()}
          />
        ) : (
          <button
            class="font-mono text-sm hover:text-primary transition-colors cursor-text"
            onClick={() => { setDraft(String(value)); setEditing(true) }}
          >
            {value} <span class="text-base-content/40">/ {max}</span>
          </button>
        )}
      </div>
      <progress
        class={`progress ${barClass} w-full h-2.5`}
        value={value}
        max={max}
      />
      <div class="flex justify-between mt-1.5 gap-2">
        <button
          onClick={() => onChange(clamp(value - 1))}
          disabled={value <= min}
          class="btn btn-sm flex-1 font-mono text-base font-bold disabled:opacity-25"
        >
          −
        </button>
        <button
          onClick={() => onChange(clamp(value + 1))}
          disabled={value >= max}
          class="btn btn-sm flex-1 font-mono text-base font-bold disabled:opacity-25"
        >
          +
        </button>
      </div>
    </div>
  )
}
