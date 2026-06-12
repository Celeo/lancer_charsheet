interface NavProps {
  current: string;
}

const TABS = [
  { hash: '#combat', label: 'Combat', icon: '⚔' },
  { hash: '#pilot', label: 'Pilot', icon: '◈' },
  { hash: '#mech', label: 'Mech', icon: '⬡' },
  { hash: '#actions', label: 'Actions', icon: '▶' },
  { hash: '#data', label: 'Data', icon: '⬇' },
] as const;

export function Nav({ current }: NavProps) {
  return (
    <nav class="fixed bottom-0 inset-x-0 bg-base-200 border-t border-base-300 nav-safe z-50">
      <div class="flex overflow-x-auto scrollbar-none">
        {TABS.map(({ hash, label, icon }) => {
          const active = current === hash;
          return (
            <a
              key={hash}
              href={hash}
              class={`flex-none min-w-[4.5rem] flex flex-col items-center gap-0.5 py-2 text-xs font-mono tracking-wider transition-colors
                ${active ? 'text-primary' : 'text-base-content/50 hover:text-base-content'}`}
            >
              <span class="text-base leading-none">{icon}</span>
              <span
                class={`text-[0.6rem] font-bold tracking-widest uppercase ${active ? 'text-primary' : ''}`}
              >
                {label}
              </span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
