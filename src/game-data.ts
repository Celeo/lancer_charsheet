// Typed wrappers around lancer-data + Lancer rules math
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — lancer-data has no bundled types
import * as ld from '@massif/lancer-data';
import type { Character, DerivedStats, MountWeaponSlot } from './types';

// ─── Raw data types ──────────────────────────────────────────────────────────

export interface LancerFrameStats {
  size: number;
  structure: number;
  stress: number;
  armor: number;
  hp: number;
  evasion: number;
  edef: number;
  heatcap: number;
  repcap: number;
  sensor_range: number;
  tech_attack: number;
  save: number;
  speed: number;
  sp: number;
}

export interface LancerFrameTrait {
  name: string;
  description: string;
}

export interface LancerFrame {
  id: string;
  name: string;
  source: string;
  license_level: number;
  mounts: string[];
  stats: LancerFrameStats;
  traits: LancerFrameTrait[];
  core_system: {
    name: string;
    active_name: string;
    active_effect: string;
    passive_name?: string;
    passive_effect?: string;
    activation: string;
  };
}

export interface LancerDamage {
  type: string;
  val: string | number;
}

export interface LancerRange {
  type: string;
  val: number;
}

export interface LancerTag {
  id: string;
  val?: string | number;
}

export interface LancerWeapon {
  id: string;
  name: string;
  mount: string; // 'Auxiliary' | 'Main' | 'Heavy' | 'Superheavy'
  type: string;
  damage?: LancerDamage[];
  range?: LancerRange[];
  tags?: LancerTag[];
  source: string;
  license: string;
  license_level: number;
  effect?: string;
  on_attack?: string;
  on_hit?: string;
  on_crit?: string;
}

export interface LancerSystem {
  id: string;
  name: string;
  type: string;
  sp: number;
  tags?: LancerTag[];
  source: string;
  license: string;
  license_level: number;
  effect?: string;
  actions?: unknown[];
  passive_name?: string;
  passive_effect?: string;
  bonuses?: Array<{ id: string; val: number | string }>;
}

export interface LancerTalent {
  id: string;
  name: string;
  terse?: string;
  ranks: Array<{ name: string; description: string }>;
}

export interface LancerSkill {
  id: string;
  name: string;
  description: string;
  detail: string;
  family: string;
}

export interface LancerTagDef {
  id: string;
  name: string;
  description?: string;
}

export interface LancerCoreBonus {
  id: string;
  name: string;
  source: string;
  effect: string;
  description?: string;
}

// ─── Exported typed collections ──────────────────────────────────────────────

export const frames: LancerFrame[] = (ld.frames as LancerFrame[]).filter(
  (f) => f.id !== 'missing_frame',
);
export const weapons: LancerWeapon[] = ld.weapons as LancerWeapon[];
export const systems: LancerSystem[] = ld.systems as LancerSystem[];
export const talents: LancerTalent[] = ld.talents as LancerTalent[];
export const skills: LancerSkill[] = ld.skills as LancerSkill[];
export const tagDefs: LancerTagDef[] = ld.tags as LancerTagDef[];
export const coreBonuses: LancerCoreBonus[] = ld.core_bonuses as LancerCoreBonus[];

export function getFrame(id: string): LancerFrame | undefined {
  return frames.find((f) => f.id === id);
}

export function getWeapon(id: string): LancerWeapon | undefined {
  return weapons.find((w) => w.id === id);
}

export function getSystem(id: string): LancerSystem | undefined {
  return systems.find((s) => s.id === id);
}

export function getTalent(id: string): LancerTalent | undefined {
  return talents.find((t) => t.id === id);
}

export function getSkill(id: string): LancerSkill | undefined {
  return skills.find((s) => s.id === id);
}

export function getTag(id: string): LancerTagDef | undefined {
  return tagDefs.find((t) => t.id === id);
}

export function getCoreBonus(id: string): LancerCoreBonus | undefined {
  return coreBonuses.find((cb) => cb.id === id);
}

// ─── Weapons filtered by what a mount accepts ────────────────────────────────

const MOUNT_ACCEPTS: Record<string, string[]> = {
  Auxiliary: ['Auxiliary'],
  Main: ['Main', 'Auxiliary'],
  Heavy: ['Heavy', 'Main', 'Auxiliary'],
  Flex: ['Main', 'Auxiliary'],
  'Aux/Aux': ['Auxiliary'],
  'Main/Aux': ['Main', 'Auxiliary'],
  Integrated: [],
  Superheavy: ['Superheavy', 'Heavy', 'Main', 'Auxiliary'],
};

export function weaponsForMount(mountType: string): LancerWeapon[] {
  const accepted = MOUNT_ACCEPTS[mountType] ?? [];
  return weapons.filter((w) => accepted.includes(w.mount));
}

// Slots per mount type: [Main slot size, Aux slot size?, ...]
export function mountSlots(mountType: string): string[] {
  switch (mountType) {
    case 'Aux/Aux':
      return ['Auxiliary', 'Auxiliary'];
    case 'Main/Aux':
      return ['Main', 'Auxiliary'];
    case 'Flex':
      return ['Flex']; // special handling in UI
    default:
      return [mountType];
  }
}

export function defaultMounts(frame: LancerFrame): MountWeaponSlot[] {
  return frame.mounts.map((mt) => ({
    weapons: mountSlots(mt).map(() => null),
  }));
}

// ─── Derived stat calculations (Lancer core rules) ───────────────────────────

export function calcGrit(ll: number): number {
  return Math.ceil(ll / 2);
}

export function calcDerived(char: Character): DerivedStats {
  const { ll, hull, agility, systems, engineering } = char.pilot;
  const grit = calcGrit(ll);
  const frame = getFrame(char.mech.frameId);
  const fs = frame?.stats;

  const systemHpBonus = char.mech.systems.reduce((sum, id) => {
    const bonus = getSystem(id)?.bonuses?.find((b) => b.id === 'hp');
    return sum + (bonus ? Number(bonus.val) : 0);
  }, 0);

  return {
    grit,
    // Pilot derived
    pilotHpMax: 6 + grit,
    pilotEvasion: 10,
    pilotEdef: 10,
    pilotSpeed: 4,
    // Mech derived (frame base + HASE)
    mechHpMax: (fs?.hp ?? 10) + grit + hull * 2 + systemHpBonus,
    mechHeatCap: (fs?.heatcap ?? 6) + engineering,
    mechRepairCap: (fs?.repcap ?? 5) + Math.floor(hull / 2),
    mechEvasion: (fs?.evasion ?? 8) + agility,
    mechEdef: (fs?.edef ?? 8) + systems,
    mechSpeed: (fs?.speed ?? 4) + Math.floor(agility / 2),
    mechSave: 10 + grit,
    mechTechAttack: (fs?.tech_attack ?? 0) + systems,
    mechSensors: fs?.sensor_range ?? 10,
    mechSp: (fs?.sp ?? 6) + grit + Math.floor(systems / 2),
    mechSize: fs?.size ?? 1,
    mechArmor: fs?.armor ?? 0,
  };
}

// ─── Lancer status conditions ─────────────────────────────────────────────────

export const MECH_STATUSES = [
  'Bolstered',
  'Braced',
  'Downlocked',
  'Exposed',
  'Hidden',
  'Invisible',
  'Jammed',
  'Lock On',
  'Prone',
  'Shredded',
  'Slow',
  'Stunned',
] as const;

export const PILOT_STATUSES = ['Bleeding Out', 'Down and Out', 'Stunned'] as const;

export type MechStatus = (typeof MECH_STATUSES)[number];
export type PilotStatus = (typeof PILOT_STATUSES)[number];

// ─── Default character ────────────────────────────────────────────────────────

export const DEFAULT_CHARACTER: Character = {
  meta: { callsign: '', name: '', background: '' },
  pilot: {
    ll: 0,
    hull: 0,
    agility: 0,
    systems: 0,
    engineering: 0,
    armor: 0,
    skills: [],
    talents: [],
  },
  mech: {
    frameId: 'mf_standard_pattern_i_everest',
    name: '',
    mounts: defaultMounts(
      frames.find((f) => f.id === 'mf_standard_pattern_i_everest') ?? frames[1],
    ),
    systems: [],
    coreBonuses: [],
  },
  combat: {
    mechHp: 12, // Everest HP at LL0 (10 + 0*2)
    mechHeat: 0,
    structure: 4,
    stress: 4,
    repairsUsed: 0,
    coreActive: false,
    burn: 0,
    pilotHp: 10,
    statuses: [],
  },
};
