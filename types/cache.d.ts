import type { MoonPhase, OrbPhase, SchoolName } from './events'

export interface OverheardCache {
  online?: number
  moon?: MoonPhase
  scrolls: Partial<Record<SchoolName, OrbPhase>>
}
