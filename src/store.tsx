import { createContext } from 'preact';
import { useContext, useState, useEffect, useCallback } from 'preact/hooks';
import type { Character, CombatState, MechConfig, PilotMeta, PilotStats } from './types';
import { DEFAULT_CHARACTER, calcDerived, getFrame, defaultMounts } from './game-data';

const STORAGE_KEY = 'lancer-charsheet-v1';

function load(): Character {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Character;
  } catch {
    // ignore
  }
  return DEFAULT_CHARACTER;
}

function save(char: Character) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(char));
  } catch {
    // ignore
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface CharacterContextValue {
  character: Character;
  derived: ReturnType<typeof calcDerived>;
  updateMeta: (partial: Partial<PilotMeta>) => void;
  updatePilot: (partial: Partial<PilotStats>) => void;
  updateMech: (partial: Partial<MechConfig>) => void;
  updateCombat: (partial: Partial<CombatState>) => void;
  resetCombat: () => void;
  importCharacter: (c: Character) => void;
}

export const CharacterContext = createContext<CharacterContextValue>(
  null as unknown as CharacterContextValue,
);

export function useCharacter(): CharacterContextValue {
  return useContext(CharacterContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

interface CharacterProviderProps {
  children: preact.ComponentChildren;
}

export function CharacterProvider({ children }: CharacterProviderProps) {
  const [character, setCharacter] = useState<Character>(load);

  // Persist on every change
  useEffect(() => {
    save(character);
  }, [character]);

  const updateMeta = useCallback((partial: Partial<PilotMeta>) => {
    setCharacter((c) => ({ ...c, meta: { ...c.meta, ...partial } }));
  }, []);

  const updatePilot = useCallback((partial: Partial<PilotStats>) => {
    setCharacter((c) => ({ ...c, pilot: { ...c.pilot, ...partial } }));
  }, []);

  const updateMech = useCallback((partial: Partial<MechConfig>) => {
    setCharacter((c) => {
      const next = { ...c, mech: { ...c.mech, ...partial } };
      // When frame changes, reset mounts to match new frame layout
      if (partial.frameId && partial.frameId !== c.mech.frameId) {
        const frame = getFrame(partial.frameId);
        if (frame) {
          next.mech.mounts = defaultMounts(frame);
        }
      }
      return next;
    });
  }, []);

  const updateCombat = useCallback((partial: Partial<CombatState>) => {
    setCharacter((c) => ({ ...c, combat: { ...c.combat, ...partial } }));
  }, []);

  const importCharacter = useCallback((c: Character) => {
    setCharacter(c);
  }, []);

  const resetCombat = useCallback(() => {
    setCharacter((c) => {
      const d = calcDerived(c);
      return {
        ...c,
        combat: {
          mechHp: d.mechHpMax,
          mechHeat: 0,
          structure: 4,
          stress: 4,
          repairsUsed: 0,
          coreActive: false,
          burn: 0,
          pilotHp: d.pilotHpMax,
          statuses: [],
        },
      };
    });
  }, []);

  const derived = calcDerived(character);

  const value: CharacterContextValue = {
    character,
    derived,
    updateMeta,
    updatePilot,
    updateMech,
    updateCombat,
    resetCombat,
    importCharacter,
  };

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
}
