interface BoxTrackerProps {
  label: string;
  total: number;
  filled: number; // number of intact boxes (counting down from total)
  onChange: (filled: number) => void;
  colorClass?: string; // Tailwind bg- class for filled boxes
}

export function BoxTracker({
  label,
  total,
  filled,
  onChange,
  colorClass = 'bg-primary',
}: BoxTrackerProps) {
  return (
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <span class="section-label">{label}</span>
        <span class="text-xs font-mono text-base-content/50">
          {filled} / {total}
        </span>
      </div>
      <div class="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => {
          const intact = i < filled;
          return (
            <button
              key={i}
              onClick={() => onChange(intact ? i : i + 1)}
              title={intact ? 'Click to mark damaged' : 'Click to restore'}
              class={`w-9 h-9 border-2 transition-all
                ${
                  intact
                    ? `${colorClass} border-transparent`
                    : 'bg-transparent border-base-content/35 hover:border-base-content/50'
                }`}
            />
          );
        })}
      </div>
    </div>
  );
}
