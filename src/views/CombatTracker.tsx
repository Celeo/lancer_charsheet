import { useCharacter } from '../store'
import { Counter } from '../components/Counter'
import { BoxTracker } from '../components/BoxTracker'
import { MECH_STATUSES } from '../game-data'

export function CombatTracker() {
  const { character, derived, updateCombat, resetCombat } = useCharacter()
  const { combat } = character

  const toggleStatus = (s: string) => {
    const next = combat.statuses.includes(s)
      ? combat.statuses.filter((x) => x !== s)
      : [...combat.statuses, s]
    updateCombat({ statuses: next })
  }

  return (
    <div class="space-y-5 pb-4">

      {/* Header */}
      <div class="flex items-center justify-between">
        <div>
          <div class="text-xs text-base-content/40 tracking-widest uppercase">
            {character.meta.callsign || '[ CALLSIGN ]'}
          </div>
          <div class="font-mono font-bold text-base-content/70 text-sm">
            {character.mech.name || character.mech.frameId.replace('mf_', '').replace(/_/g, ' ').toUpperCase()}
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm('Reset combat state to full health?')) resetCombat()
          }}
          class="btn btn-xs btn-ghost text-base-content/40 hover:text-base-content font-mono tracking-wider"
        >
          [RESET]
        </button>
      </div>

      {/* ── MECH ── */}
      <section>
        <div class="section-label">// MECH STATUS</div>
        <div class="card bg-base-200 p-4 space-y-4">

          <Counter
            label="HP"
            value={combat.mechHp}
            max={derived.mechHpMax}
            onChange={(v) => updateCombat({ mechHp: v })}
            progressClass="progress-primary"
          />

          <Counter
            label="HEAT"
            value={combat.mechHeat}
            max={derived.mechHeatCap}
            onChange={(v) => updateCombat({ mechHeat: v })}
            progressClass="progress-warning"
            warn
          />

          <BoxTracker
            label="STRUCTURE"
            total={4}
            filled={combat.structure}
            onChange={(v) => updateCombat({ structure: v })}
            colorClass="bg-error"
          />

          <BoxTracker
            label="REACTOR STRESS"
            total={4}
            filled={combat.stress}
            onChange={(v) => updateCombat({ stress: v })}
            colorClass="bg-warning"
          />

          {/* Repairs */}
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="section-label">REPAIRS</span>
              <span class="text-xs font-mono text-base-content/50">
                {derived.mechRepairCap - combat.repairsUsed} remaining
              </span>
            </div>
            <div class="flex gap-1.5 flex-wrap">
              {Array.from({ length: derived.mechRepairCap }, (_, i) => {
                const used = i < combat.repairsUsed
                return (
                  <button
                    key={i}
                    onClick={() => updateCombat({ repairsUsed: used ? i : i + 1 })}
                    title={used ? 'Click to restore' : 'Click to use repair'}
                    class={`w-9 h-9 border-2 transition-all
                      ${used
                        ? 'bg-transparent border-base-content/20'
                        : 'bg-success border-transparent'
                      }`}
                  />
                )
              })}
            </div>
          </div>

          {/* Burn + Core */}
          <div class="flex gap-4 items-start">
            <div class="flex-1">
              <div class="section-label mb-1">BURN</div>
              <div class="flex items-center gap-2">
                <button
                  onClick={() => updateCombat({ burn: Math.max(0, combat.burn - 1) })}
                  class="btn btn-xs btn-ghost font-mono font-bold"
                  disabled={combat.burn <= 0}
                >−</button>
                <span class={`font-mono font-bold text-lg w-6 text-center ${combat.burn > 0 ? 'text-error' : 'text-base-content/30'}`}>
                  {combat.burn}
                </span>
                <button
                  onClick={() => updateCombat({ burn: combat.burn + 1 })}
                  class="btn btn-xs btn-ghost font-mono font-bold"
                >+</button>
              </div>
            </div>

            <div class="flex-1">
              <div class="section-label mb-1">CORE</div>
              <button
                onClick={() => updateCombat({ coreActive: !combat.coreActive })}
                class={`btn btn-sm font-mono text-xs tracking-wider w-full
                  ${combat.coreActive ? 'btn-primary' : 'btn-ghost border border-base-content/20'}`}
              >
                {combat.coreActive ? 'ACTIVE' : 'STANDBY'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── PILOT ── */}
      <section>
        <div class="section-label">// PILOT STATUS</div>
        <div class="card bg-base-200 p-4 space-y-4">
          <Counter
            label="HP"
            value={combat.pilotHp}
            max={derived.pilotHpMax}
            onChange={(v) => updateCombat({ pilotHp: v })}
            progressClass="progress-success"
          />
        </div>
      </section>

      {/* ── STATUSES ── */}
      <section>
        <div class="section-label">// CONDITIONS & STATUSES</div>
        <div class="flex flex-wrap gap-2">
          {MECH_STATUSES.map((s) => {
            const active = combat.statuses.includes(s)
            return (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                class={`btn btn-xs font-mono tracking-wider
                  ${active ? 'btn-error' : 'btn-ghost border border-base-content/20 opacity-60 hover:opacity-100'}`}
              >
                {s}
              </button>
            )
          })}
        </div>
      </section>

    </div>
  )
}
