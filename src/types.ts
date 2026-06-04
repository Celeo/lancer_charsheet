export interface PilotMeta {
  callsign: string
  name: string
  background: string
}

export interface SkillEntry {
  id: string
  bonus: number  // +2, +4, +6
}

export interface TalentEntry {
  id: string
  rank: number  // 1–3
}

export interface PilotStats {
  ll: number           // License Level 0–12
  hull: number         // HASE stat −2 to +6
  agility: number
  systems: number
  engineering: number
  armor: number        // pilot armor 0–4
  skills: SkillEntry[]
  talents: TalentEntry[]
}

export interface MountWeaponSlot {
  weapons: (string | null)[]  // weapon IDs per slot
}

export interface MechConfig {
  frameId: string
  name: string
  mounts: MountWeaponSlot[]  // one entry per mount on the frame
  systems: string[]           // system IDs installed
}

export interface CombatState {
  mechHp: number
  mechHeat: number
  structure: number    // boxes remaining (0–4)
  stress: number       // boxes remaining (0–4)
  repairsUsed: number
  coreActive: boolean
  burn: number
  pilotHp: number
  statuses: string[]
}

export interface Character {
  meta: PilotMeta
  pilot: PilotStats
  mech: MechConfig
  combat: CombatState
}

export interface DerivedStats {
  grit: number
  pilotHpMax: number
  pilotEvasion: number
  pilotEdef: number
  pilotSpeed: number
  mechHpMax: number
  mechHeatCap: number
  mechRepairCap: number
  mechEvasion: number
  mechEdef: number
  mechSpeed: number
  mechSave: number
  mechTechAttack: number
  mechSensors: number
  mechSp: number
  mechSize: number
  mechArmor: number
}
