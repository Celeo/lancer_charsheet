interface StatRowProps {
  label: string;
  value: string | number;
  sub?: string | number;
  accent?: boolean;
}

export function StatRow({ label, value, sub, accent }: StatRowProps) {
  return (
    <div class="flex items-center justify-between py-1.5 border-b border-base-300/50 last:border-0">
      <span class="text-xs font-mono font-bold tracking-widest uppercase text-base-content/50">
        {label}
      </span>
      <span class={`font-mono font-bold text-sm ${accent ? 'text-primary' : 'text-base-content'}`}>
        {value}
        {sub !== undefined && <span class="text-base-content/40 text-xs ml-1">/ {sub}</span>}
      </span>
    </div>
  );
}

interface HASEStatProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

export function HASEStat({ label, value, onChange }: HASEStatProps) {
  return (
    <div class="flex items-center justify-between py-2 border-b border-base-300/50 last:border-0">
      <span class="text-xs font-mono font-bold tracking-widest uppercase text-base-content/50">
        {label}
      </span>
      <div class="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(-2, value - 1))}
          class="btn btn-xs btn-ghost font-mono font-bold w-7 h-7 p-0"
          disabled={value <= -2}
        >
          −
        </button>
        <span
          class={`font-mono font-bold text-sm w-6 text-center ${value > 0 ? 'text-primary' : value < 0 ? 'text-error' : 'text-base-content'}`}
        >
          {value > 0 ? `+${value}` : value}
        </span>
        <button
          onClick={() => onChange(Math.min(6, value + 1))}
          class="btn btn-xs btn-ghost font-mono font-bold w-7 h-7 p-0"
          disabled={value >= 6}
        >
          +
        </button>
      </div>
    </div>
  );
}
