import { useRef, useState } from 'preact/hooks';
import type { Character } from '../types';
import { useCharacter } from '../store';

function exportCharacter(character: Character) {
  const json = JSON.stringify(character, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `lancer-${character.meta.callsign || 'pilot'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataPanel() {
  const { character, importCharacter } = useCharacter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);

  function handleExport() {
    exportCharacter(character);
    setStatus({ ok: true, msg: 'Character exported.' });
  }

  function handleImportClick() {
    setStatus(null);
    fileInputRef.current?.click();
  }

  function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed?.meta && parsed?.pilot && parsed?.mech && parsed?.combat) {
          importCharacter(parsed as Character);
          setStatus({ ok: true, msg: 'Character imported successfully.' });
        } else {
          setStatus({ ok: false, msg: 'Invalid file: missing required character fields.' });
        }
      } catch {
        setStatus({ ok: false, msg: 'Could not parse file as JSON.' });
      }
      // Reset input so the same file can be re-imported if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  }

  return (
    <div class="space-y-6">
      <div>
        <div class="section-label">Data</div>
        <p class="text-base-content/60 text-sm mt-1">
          Export your character to a JSON file to back it up or move it to another browser. Import a
          previously exported file to restore it.
        </p>
      </div>

      <div class="space-y-3">
        <div class="bg-base-200 rounded-lg p-4 flex items-center justify-between gap-4">
          <div>
            <div class="font-mono text-sm font-bold">Export</div>
            <div class="text-base-content/60 text-xs mt-0.5">Download character as JSON</div>
          </div>
          <button class="btn btn-primary btn-sm font-mono" onClick={handleExport}>
            Export JSON
          </button>
        </div>

        <div class="bg-base-200 rounded-lg p-4 flex items-center justify-between gap-4">
          <div>
            <div class="font-mono text-sm font-bold">Import</div>
            <div class="text-base-content/60 text-xs mt-0.5">
              Load a JSON file — overwrites current character
            </div>
          </div>
          <button class="btn btn-outline btn-sm font-mono" onClick={handleImportClick}>
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            class="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {status && (
        <div
          class={`text-sm font-mono px-3 py-2 rounded ${status.ok ? 'text-success bg-success/10' : 'text-error bg-error/10'}`}
        >
          {status.msg}
        </div>
      )}
    </div>
  );
}
