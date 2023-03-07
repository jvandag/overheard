import type { MoonPhase, OrbPhase, SchoolName } from './events'

export interface OverheardCache {
  online: number | null
  moon: MoonPhase | null
  scrolls: Partial<Record<SchoolName, OrbPhase>>
}
