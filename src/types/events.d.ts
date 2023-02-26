export type MoonState = 'new' | 'full'
export type OrbName = 'white' | 'black' | 'red' | 'green' | 'purple' | 'yellow' | 'cyan' | 'blue'
export type OrbPhase = 'dark' | 'glowing' | 'normal'

export interface OverheardEvents {
  online: Array<[number]>
  moon: Array<[MoonState]>
  scrolls: Array<{ name: OrbName; phase: OrbPhase }>
}
