export type OrbName = 'white' | 'black' | 'green' | 'red' | 'purple' | 'yellow' | 'cyan' | 'blue'
export type OrbPhase = 'normal' | 'glowing' | 'dark'
export type MoonPhase =
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full'
  | 'waning_gibbous'
  | 'third_quarter'
  | 'waning_crescent'
  | 'new'
export type SchoolName =
  | 'divination'
  | 'evocation'
  | 'enchantment'
  | 'necromancy'
  | 'transmutation'
  | 'conjuration'
  | 'abjuration'
  | 'illusion'

/** Scroll state */
export interface ScrollState {
  name: SchoolName
  phase: OrbPhase
}

/** Parsed game state */
export interface GameState {
  online: number
  moon: MoonPhase
  scrolls: ScrollState[]
}

/** Overheard events */
export interface OverheardEvent {
  online: [number, number]
  moon: MoonPhase
  scrolls: ScrollState[]
}
