import { useState } from 'preact/hooks';
import { actions } from '../game-data';

// Activation types in display order
const GROUPS: { activation: string; label: string; accent: string }[] = [
  { activation: 'Move', label: '// MOVEMENT', accent: 'text-base-content/70' },
  { activation: 'Free', label: '// FREE ACTIONS', accent: 'text-success' },
  { activation: 'Quick', label: '// QUICK ACTIONS', accent: 'text-primary' },
  { activation: 'Quick Tech', label: '// QUICK TECH', accent: 'text-info' },
  { activation: 'Invade', label: '// INVADE OPTIONS', accent: 'text-info' },
  { activation: 'Full', label: '// FULL ACTIONS', accent: 'text-warning' },
  { activation: 'Jockey', label: '// JOCKEY OPTIONS', accent: 'text-warning' },
  { activation: 'Reaction', label: '// REACTIONS', accent: 'text-error' },
];

const ACTIVATION_BADGE: Record<string, string> = {
  Move: 'bg-base-300 text-base-content/60',
  Free: 'bg-success/20 text-success',
  Quick: 'bg-primary/20 text-primary',
  'Quick Tech': 'bg-info/20 text-info',
  Invade: 'bg-info/20 text-info',
  Full: 'bg-warning/20 text-warning',
  Jockey: 'bg-warning/20 text-warning',
  Reaction: 'bg-error/20 text-error',
};

export function ActionsView() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div class="space-y-5 pb-4">
      {GROUPS.map(({ activation, label, accent }) => {
        const group = actions.filter((a) => a.activation === activation);
        if (group.length === 0) return null;
        return (
          <section key={activation}>
            <div class={`section-label ${accent}`}>{label}</div>
            <div class="card bg-base-200 p-4 space-y-1">
              {group.map((action) => {
                const isOpen = expanded === action.id;
                const badgeClass =
                  ACTIVATION_BADGE[activation] ?? 'bg-base-300 text-base-content/60';
                return (
                  <div
                    key={action.id}
                    class="border-b border-base-300/50 last:border-0 pb-2 last:pb-0 mb-2 last:mb-0"
                  >
                    <button
                      onClick={() => setExpanded(isOpen ? null : action.id)}
                      class="w-full flex items-start justify-between gap-2 text-left"
                    >
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 flex-wrap">
                          <span class="text-sm font-mono font-bold text-base-content/90">
                            {action.name}
                          </span>
                          {action.pilot && (
                            <span class="text-[0.55rem] font-mono px-1 py-0.5 rounded bg-base-300 text-base-content/40 uppercase tracking-wider">
                              pilot
                            </span>
                          )}
                        </div>
                        {action.terse && !isOpen && (
                          <p class="text-[0.65rem] font-mono text-base-content/50 mt-0.5 leading-relaxed">
                            {action.terse}
                          </p>
                        )}
                      </div>
                      <span
                        class={`flex-none text-[0.55rem] font-mono font-bold px-1.5 py-0.5 rounded uppercase tracking-wider mt-0.5 ${badgeClass}`}
                      >
                        {activation}
                      </span>
                    </button>
                    {isOpen && (
                      <div class="mt-2 px-2 py-1.5 bg-base-300 rounded text-[0.65rem] font-mono text-base-content/70 leading-relaxed">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: action.detail.replace(/<br>/g, '<br/>'),
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
