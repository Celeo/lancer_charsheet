import { useState } from 'preact/hooks'
import { useCharacter } from '../store'
import { StatRow, HASEStat } from '../components/StatRow'
import { skills as allSkills, talents as allTalents, getSkill, getTalent } from '../game-data'

export function PilotSheet() {
  const { character, derived, updateMeta, updatePilot } = useCharacter()
  const { meta, pilot } = character
  const [skillSearch, setSkillSearch] = useState('')
  const [talentSearch, setTalentSearch] = useState('')

  // ── Helpers ──────────────────────────────────────────────────────────────

  function addSkill(id: string) {
    if (pilot.skills.some((s) => s.id === id)) return
    updatePilot({ skills: [...pilot.skills, { id, bonus: 2 }] })
    setSkillSearch('')
  }

  function removeSkill(id: string) {
    updatePilot({ skills: pilot.skills.filter((s) => s.id !== id) })
  }

  function setSkillBonus(id: string, bonus: number) {
    updatePilot({
      skills: pilot.skills.map((s) => (s.id === id ? { ...s, bonus } : s)),
    })
  }

  function addTalent(id: string) {
    if (pilot.talents.some((t) => t.id === id)) return
    updatePilot({ talents: [...pilot.talents, { id, rank: 1 }] })
    setTalentSearch('')
  }

  function removeTalent(id: string) {
    updatePilot({ talents: pilot.talents.filter((t) => t.id !== id) })
  }

  function setTalentRank(id: string, rank: number) {
    updatePilot({
      talents: pilot.talents.map((t) => (t.id === id ? { ...t, rank } : t)),
    })
  }

  const filteredSkills = allSkills.filter(
    (s) =>
      !pilot.skills.some((ps) => ps.id === s.id) &&
      s.name.toLowerCase().includes(skillSearch.toLowerCase())
  )

  const filteredTalents = allTalents.filter(
    (t) =>
      !pilot.talents.some((pt) => pt.id === t.id) &&
      t.name.toLowerCase().includes(talentSearch.toLowerCase())
  )

  return (
    <div class="space-y-5 pb-4">

      {/* ── Identity ── */}
      <section>
        <div class="section-label">// PILOT IDENTITY</div>
        <div class="card bg-base-200 p-4 space-y-3">
          {(
            [
              ['CALLSIGN', 'callsign', 'GMS-7749'],
              ['NAME', 'name', 'Harriet Voss'],
              ['BACKGROUND', 'background', 'Soldier'],
            ] as const
          ).map(([label, field, placeholder]) => (
            <div key={field}>
              <div class="section-label">{label}</div>
              <input
                type="text"
                value={meta[field]}
                placeholder={placeholder}
                onInput={(e) =>
                  updateMeta({ [field]: (e.target as HTMLInputElement).value })
                }
                class="input input-sm w-full font-mono"
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── License Level ── */}
      <section>
        <div class="section-label">// LICENSE LEVEL</div>
        <div class="card bg-base-200 p-4">
          <div class="flex items-center justify-between mb-3">
            <div>
              <span class="font-mono font-bold text-2xl text-primary">LL{pilot.ll}</span>
              <span class="text-base-content/40 text-xs ml-2 font-mono">
                GRIT +{derived.grit}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button
                onClick={() => updatePilot({ ll: Math.max(0, pilot.ll - 1) })}
                class="btn btn-sm btn-ghost font-mono font-bold"
                disabled={pilot.ll <= 0}
              >−</button>
              <button
                onClick={() => updatePilot({ ll: Math.min(12, pilot.ll + 1) })}
                class="btn btn-sm btn-ghost font-mono font-bold"
                disabled={pilot.ll >= 12}
              >+</button>
            </div>
          </div>
          <div class="flex gap-1">
            {Array.from({ length: 12 }, (_, i) => (
              <button
                key={i}
                onClick={() => updatePilot({ ll: i + 1 === pilot.ll ? i : i + 1 })}
                class={`flex-1 h-2 transition-all ${
                  i < pilot.ll ? 'bg-primary' : 'bg-base-300'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── HASE ── */}
      <section>
        <div class="section-label">// H.A.S.E.</div>
        <div class="card bg-base-200 px-4">
          <HASEStat
            label="HULL"
            value={pilot.hull}
            onChange={(v) => updatePilot({ hull: v })}
          />
          <HASEStat
            label="AGILITY"
            value={pilot.agility}
            onChange={(v) => updatePilot({ agility: v })}
          />
          <HASEStat
            label="SYSTEMS"
            value={pilot.systems}
            onChange={(v) => updatePilot({ systems: v })}
          />
          <HASEStat
            label="ENGINEERING"
            value={pilot.engineering}
            onChange={(v) => updatePilot({ engineering: v })}
          />
        </div>
      </section>

      {/* ── Derived Pilot Stats ── */}
      <section>
        <div class="section-label">// PILOT STATS</div>
        <div class="card bg-base-200 px-4">
          <StatRow label="HP" value={derived.pilotHpMax} />
          <StatRow label="EVASION" value={derived.pilotEvasion} />
          <StatRow label="E-DEFENSE" value={derived.pilotEdef} />
          <StatRow label="SPEED" value={derived.pilotSpeed} />
          <div class="flex items-center justify-between py-1.5 border-b border-base-300/50">
            <span class="text-xs font-mono font-bold tracking-widest uppercase text-base-content/50">
              ARMOR
            </span>
            <div class="flex items-center gap-2">
              <button
                onClick={() => updatePilot({ armor: Math.max(0, pilot.armor - 1) })}
                class="btn btn-xs btn-ghost font-mono font-bold"
                disabled={pilot.armor <= 0}
              >−</button>
              <span class="font-mono font-bold text-sm w-4 text-center">{pilot.armor}</span>
              <button
                onClick={() => updatePilot({ armor: Math.min(4, pilot.armor + 1) })}
                class="btn btn-xs btn-ghost font-mono font-bold"
                disabled={pilot.armor >= 4}
              >+</button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Skills ── */}
      <section>
        <div class="section-label">// SKILLS</div>
        <div class="card bg-base-200 p-4 space-y-3">

          {/* Existing skills */}
          {pilot.skills.map(({ id, bonus }) => {
            const skill = getSkill(id)
            if (!skill) return null
            return (
              <div key={id} class="flex items-center gap-2">
                <button
                  onClick={() => removeSkill(id)}
                  class="text-error/60 hover:text-error text-xs font-mono shrink-0"
                  title="Remove skill"
                >✕</button>
                <span class="flex-1 text-sm font-mono text-base-content/80">{skill.name}</span>
                <select
                  value={bonus}
                  onChange={(e) => setSkillBonus(id, parseInt((e.target as HTMLSelectElement).value))}
                  class="select select-xs font-mono w-16"
                >
                  <option value={2}>+2</option>
                  <option value={4}>+4</option>
                  <option value={6}>+6</option>
                </select>
              </div>
            )
          })}

          {/* Add skill */}
          <div class="space-y-1.5">
            <input
              type="text"
              placeholder="Search skills..."
              value={skillSearch}
              onInput={(e) => setSkillSearch((e.target as HTMLInputElement).value)}
              class="input input-sm w-full font-mono"
            />
            {skillSearch && filteredSkills.length > 0 && (
              <div class="bg-base-300 rounded overflow-hidden max-h-40 overflow-y-auto">
                {filteredSkills.slice(0, 8).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => addSkill(s.id)}
                    class="block w-full text-left px-3 py-2 text-xs font-mono hover:bg-primary/20 transition-colors"
                  >
                    <div class="font-bold text-base-content">{s.name}</div>
                    <div class="text-base-content/50 text-[0.65rem] mt-0.5">{s.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Talents ── */}
      <section>
        <div class="section-label">// TALENTS</div>
        <div class="card bg-base-200 p-4 space-y-3">

          {pilot.talents.map(({ id, rank }) => {
            const talent = getTalent(id)
            if (!talent) return null
            return (
              <div key={id} class="border-b border-base-300/50 pb-3 last:border-0 last:pb-0">
                <div class="flex items-center gap-2 mb-1">
                  <button
                    onClick={() => removeTalent(id)}
                    class="text-error/60 hover:text-error text-xs font-mono shrink-0"
                  >✕</button>
                  <span class="flex-1 text-sm font-mono font-bold text-base-content/80">
                    {talent.name}
                  </span>
                  <div class="flex gap-1">
                    {[1, 2, 3].map((r) => (
                      <button
                        key={r}
                        onClick={() => setTalentRank(id, r)}
                        class={`w-6 h-6 text-xs font-mono font-bold border transition-all
                          ${rank >= r
                            ? 'bg-primary border-primary text-primary-content'
                            : 'border-base-content/25 text-base-content/40'
                          }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                {talent.ranks[rank - 1] && (
                  <p class="text-xs text-base-content/50 font-mono pl-5">
                    {talent.ranks[rank - 1].name}
                  </p>
                )}
              </div>
            )
          })}

          {/* Add talent */}
          <div class="space-y-1.5">
            <input
              type="text"
              placeholder="Search talents..."
              value={talentSearch}
              onInput={(e) => setTalentSearch((e.target as HTMLInputElement).value)}
              class="input input-sm w-full font-mono"
            />
            {talentSearch && filteredTalents.length > 0 && (
              <div class="bg-base-300 rounded overflow-hidden max-h-40 overflow-y-auto">
                {filteredTalents.slice(0, 8).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => addTalent(t.id)}
                    class="block w-full text-left px-3 py-2 text-xs font-mono hover:bg-primary/20 transition-colors"
                  >
                    <div class="font-bold text-base-content">{t.name}</div>
                    {t.terse && (
                      <div class="text-base-content/50 text-[0.65rem] mt-0.5">{t.terse}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}
