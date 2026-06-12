import { useState } from 'preact/hooks';
import { useCharacter } from '../store';
import { StatRow } from '../components/StatRow';
import {
  frames,
  getFrame,
  getWeapon,
  getSystem,
  getTag,
  getCoreBonus,
  weaponsForMount,
  systems as allSystems,
  coreBonuses as allCoreBonuses,
  mountSlots,
} from '../game-data';

export function MechSheet() {
  const { character, derived, updateMech } = useCharacter();
  const { mech } = character;
  const [sysSearch, setSysSearch] = useState('');
  const [cbSearch, setCbSearch] = useState('');
  const [expandedTag, setExpandedTag] = useState<string | null>(null);

  const frame = getFrame(mech.frameId);

  function setWeapon(mountIdx: number, slotIdx: number, weaponId: string | null) {
    const mounts = mech.mounts.map((m, mi) =>
      mi === mountIdx
        ? {
            ...m,
            weapons: m.weapons.map((w, si) => (si === slotIdx ? weaponId : w)),
          }
        : m,
    );
    updateMech({ mounts });
  }

  function addSystem(id: string) {
    if (mech.systems.includes(id)) return;
    updateMech({ systems: [...mech.systems, id] });
    setSysSearch('');
  }

  function removeSystem(id: string) {
    updateMech({ systems: mech.systems.filter((s) => s !== id) });
  }

  const activeCbs = mech.coreBonuses ?? [];

  function addCoreBonus(id: string) {
    if (activeCbs.includes(id)) return;
    updateMech({ coreBonuses: [...activeCbs, id] });
    setCbSearch('');
  }

  function removeCoreBonus(id: string) {
    updateMech({ coreBonuses: activeCbs.filter((cb) => cb !== id) });
  }

  const usedSp = mech.systems.reduce((acc, id) => {
    const sys = getSystem(id);
    return acc + (sys?.sp ?? 0);
  }, 0);

  const filteredSystems = allSystems.filter(
    (s) => !mech.systems.includes(s.id) && s.name.toLowerCase().includes(sysSearch.toLowerCase()),
  );

  const filteredCoreBonuses = allCoreBonuses.filter(
    (cb) => !activeCbs.includes(cb.id) && cb.name.toLowerCase().includes(cbSearch.toLowerCase()),
  );

  return (
    <div class="space-y-5 pb-4">
      {/* ── Frame Selection ── */}
      <section>
        <div class="section-label">// FRAME</div>
        <div class="card bg-base-200 p-4 space-y-3">
          <div>
            <div class="section-label">DESIGNATION</div>
            <input
              type="text"
              value={mech.name}
              placeholder="Mech name / callsign..."
              onInput={(e) => updateMech({ name: (e.target as HTMLInputElement).value })}
              class="input input-sm w-full font-mono"
            />
          </div>
          <div>
            <div class="section-label">FRAME</div>
            <select
              value={mech.frameId}
              onChange={(e) => updateMech({ frameId: (e.target as HTMLSelectElement).value })}
              class="select select-sm w-full font-mono"
            >
              {frames.map((f) => (
                <option key={f.id} value={f.id}>
                  [{f.source}] {f.name.toUpperCase()}
                  {f.license_level > 0 ? ` — LL${f.license_level}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* ── Mech Stats ── */}
      <section>
        <div class="section-label">// MECH STATS</div>
        <div class="card bg-base-200 px-4">
          <StatRow label="HP" value={derived.mechHpMax} accent />
          <StatRow label="HEAT CAP" value={derived.mechHeatCap} />
          <StatRow label="REPAIR CAP" value={derived.mechRepairCap} />
          <StatRow label="STRUCTURE" value={4} />
          <StatRow label="REACTOR STRESS" value={4} />
          <StatRow label="EVASION" value={derived.mechEvasion} />
          <StatRow label="E-DEFENSE" value={derived.mechEdef} />
          <StatRow label="SPEED" value={derived.mechSpeed} />
          <StatRow label="SENSORS" value={derived.mechSensors} />
          <StatRow label="SAVE TARGET" value={derived.mechSave} />
          <StatRow label="ATTACK BONUS" value={`+${derived.grit}`} />
          <StatRow label="TECH ATTACK" value={`+${derived.mechTechAttack}`} />
          <StatRow label="SP" value={`${usedSp} / ${derived.mechSp}`} />
          <StatRow label="SIZE" value={derived.mechSize} />
          <StatRow label="ARMOR" value={derived.mechArmor} />
        </div>
      </section>

      {/* ── Traits ── */}
      {frame && frame.traits.length > 0 && (
        <section>
          <div class="section-label">// FRAME TRAITS</div>
          <div class="card bg-base-200 p-4 space-y-3">
            {frame.traits.map((trait) => (
              <div key={trait.name}>
                <div class="font-mono font-bold text-sm text-primary">{trait.name}</div>
                <div
                  class="text-xs text-base-content/60 font-mono mt-0.5 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: trait.description }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Core System ── */}
      {frame?.core_system && (
        <section>
          <div class="section-label">// CORE SYSTEM</div>
          <div class="card bg-base-200 p-4">
            <div class="font-mono font-bold text-sm text-primary mb-1">
              {frame.core_system.name}
            </div>
            {frame.core_system.passive_name && (
              <div class="mb-2">
                <div class="text-xs font-mono font-bold text-base-content/50 tracking-wider uppercase mb-0.5">
                  Passive — {frame.core_system.passive_name}
                </div>
                <div
                  class="text-xs text-base-content/60 font-mono leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: frame.core_system.passive_effect ?? '' }}
                />
              </div>
            )}
            <div>
              <div class="text-xs font-mono font-bold text-base-content/50 tracking-wider uppercase mb-0.5">
                Active ({frame.core_system.activation}) — {frame.core_system.active_name}
              </div>
              <div
                class="text-xs text-base-content/60 font-mono leading-relaxed"
                dangerouslySetInnerHTML={{ __html: frame.core_system.active_effect }}
              />
            </div>
          </div>
        </section>
      )}

      {/* ── Weapons / Mounts ── */}
      {frame && (
        <section>
          <div class="section-label">// LOADOUT — WEAPONS</div>
          <div class="card bg-base-200 p-4 space-y-4">
            {frame.mounts.map((mountType, mountIdx) => {
              const slots = mountSlots(mountType);
              const mountData = mech.mounts[mountIdx];

              return (
                <div
                  key={mountIdx}
                  class="border-b border-base-300/50 pb-4 last:border-0 last:pb-0"
                >
                  <div class="section-label mb-2">{mountType} MOUNT</div>
                  {slots.map((slotSize, slotIdx) => {
                    const selectedId = mountData?.weapons[slotIdx] ?? null;
                    const selected = selectedId ? getWeapon(selectedId) : null;
                    const options = weaponsForMount(slotSize === 'Flex' ? 'Main' : slotSize);

                    return (
                      <div key={slotIdx} class="space-y-1 mb-2 last:mb-0">
                        {slots.length > 1 && (
                          <div class="text-[0.6rem] text-base-content/60 font-mono tracking-widest uppercase">
                            {slotSize} slot
                          </div>
                        )}
                        <select
                          value={selectedId ?? ''}
                          onChange={(e) => {
                            const v = (e.target as HTMLSelectElement).value;
                            setWeapon(mountIdx, slotIdx, v || null);
                          }}
                          class="select select-xs w-full font-mono"
                        >
                          <option value="">— empty —</option>
                          {options.map((w) => (
                            <option key={w.id} value={w.id}>
                              [{w.source}] {w.name}
                            </option>
                          ))}
                        </select>
                        {selected && (
                          <div class="text-[0.65rem] font-mono text-base-content/50 px-1 space-y-0.5">
                            {selected.damage && (
                              <div>
                                {selected.damage.map((d) => `${d.val} ${d.type}`).join(', ')}
                                {selected.range &&
                                  ` — ${selected.range.map((r) => `${r.type} ${r.val}`).join(', ')}`}
                              </div>
                            )}
                            {selected.tags && selected.tags.length > 0 && (
                              <div class="mt-0.5">
                                <div class="flex flex-wrap gap-1">
                                  {selected.tags.map((t) => {
                                    const def = getTag(t.id);
                                    const valStr = t.val !== undefined ? String(t.val) : '';
                                    const label = def
                                      ? def.name.replace(/{VAL}/g, valStr)
                                      : t.id.replace('tg_', '').replace(/_/g, ' ');
                                    const key = `${mountIdx}-${slotIdx}-${t.id}`;
                                    const isOpen = expandedTag === key;
                                    return (
                                      <button
                                        key={t.id}
                                        onClick={() => setExpandedTag(isOpen ? null : key)}
                                        class={`font-mono text-[0.6rem] px-1.5 py-0.5 rounded transition-colors ${
                                          isOpen
                                            ? 'bg-primary text-primary-content'
                                            : 'bg-base-300 text-primary/80 hover:bg-primary/20'
                                        }`}
                                      >
                                        {label}
                                      </button>
                                    );
                                  })}
                                </div>
                                {(() => {
                                  if (!expandedTag?.startsWith(`${mountIdx}-${slotIdx}-`))
                                    return null;
                                  const tagId = expandedTag.slice(`${mountIdx}-${slotIdx}-`.length);
                                  const t = selected.tags?.find((x) => x.id === tagId);
                                  if (!t) return null;
                                  const def = getTag(t.id);
                                  if (!def?.description) return null;
                                  const valStr = t.val !== undefined ? String(t.val) : '';
                                  return (
                                    <div class="mt-1.5 px-2 py-1.5 bg-base-300 rounded text-[0.65rem] font-mono text-base-content/70 leading-relaxed">
                                      <span class="text-primary/70 font-bold">
                                        {def.name.replace(/{VAL}/g, valStr)}
                                      </span>
                                      {' — '}
                                      {def.description.replace(/{VAL}/g, valStr)}
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Systems ── */}
      <section>
        <div class="section-label">
          // SYSTEMS ({usedSp}/{derived.mechSp} SP)
        </div>
        <div class="card bg-base-200 p-4 space-y-3">
          {mech.systems.map((id) => {
            const sys = getSystem(id);
            if (!sys) return null;
            return (
              <div
                key={id}
                class="flex items-start gap-2 border-b border-base-300/50 pb-2 last:border-0 last:pb-0"
              >
                <button
                  onClick={() => removeSystem(id)}
                  class="text-error/60 hover:text-error text-xs font-mono shrink-0 mt-0.5"
                >
                  ✕
                </button>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-sm font-mono font-bold text-base-content/80 truncate">
                      {sys.name}
                    </span>
                    <span class="text-xs font-mono text-base-content/60 shrink-0">{sys.sp} SP</span>
                  </div>
                  {sys.effect && (
                    <p
                      class="text-[0.65rem] font-mono text-base-content/50 mt-0.5 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: sys.effect }}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* Add system */}
          <div class="space-y-1.5">
            <input
              type="text"
              placeholder="Search systems..."
              value={sysSearch}
              onInput={(e) => setSysSearch((e.target as HTMLInputElement).value)}
              class="input input-sm w-full font-mono"
            />
            {sysSearch && filteredSystems.length > 0 && (
              <div class="bg-base-300 rounded overflow-hidden max-h-48 overflow-y-auto">
                {filteredSystems.slice(0, 10).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => addSystem(s.id)}
                    class="flex w-full text-left px-3 py-2 text-xs font-mono hover:bg-primary/20 transition-colors gap-2 items-start"
                  >
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-base-content truncate">{s.name}</div>
                      <div class="text-base-content/60 text-[0.6rem]">
                        [{s.source}] {s.type} — {s.license}
                        {s.license_level > 0 ? ` LL${s.license_level}` : ''}
                      </div>
                    </div>
                    <div class="text-base-content/50 shrink-0 font-bold">{s.sp}SP</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Core Bonuses ── */}
      <section>
        <div class="section-label">// CORE BONUSES</div>
        <div class="card bg-base-200 p-4 space-y-3">
          {activeCbs.map((id) => {
            const cb = getCoreBonus(id);
            if (!cb) return null;
            return (
              <div
                key={id}
                class="flex items-start gap-2 border-b border-base-300/50 pb-2 last:border-0 last:pb-0"
              >
                <button
                  onClick={() => removeCoreBonus(id)}
                  class="text-error/60 hover:text-error text-xs font-mono shrink-0 mt-0.5"
                >
                  ✕
                </button>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-2">
                    <span class="text-sm font-mono font-bold text-base-content/80 truncate">
                      {cb.name}
                    </span>
                    <span class="text-xs font-mono text-base-content/40 shrink-0">{cb.source}</span>
                  </div>
                  <p class="text-[0.65rem] font-mono text-base-content/50 mt-0.5 leading-relaxed">
                    {cb.effect}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Add core bonus */}
          <div class="space-y-1.5">
            <input
              type="text"
              placeholder="Search core bonuses..."
              value={cbSearch}
              onInput={(e) => setCbSearch((e.target as HTMLInputElement).value)}
              class="input input-sm w-full font-mono"
            />
            {cbSearch && filteredCoreBonuses.length > 0 && (
              <div class="bg-base-300 rounded overflow-hidden max-h-48 overflow-y-auto">
                {filteredCoreBonuses.slice(0, 10).map((cb) => (
                  <button
                    key={cb.id}
                    onClick={() => addCoreBonus(cb.id)}
                    class="flex w-full text-left px-3 py-2 text-xs font-mono hover:bg-primary/20 transition-colors gap-2 items-start"
                  >
                    <div class="flex-1 min-w-0">
                      <div class="font-bold text-base-content truncate">{cb.name}</div>
                      <div class="text-base-content/60 text-[0.6rem]">[{cb.source}]</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
