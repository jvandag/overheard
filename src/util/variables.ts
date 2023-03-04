import type { OrbName, SchoolName } from 'types'

/** Webpage url */
export const OVERHEARD_URL = 'https://aberoth.com/highscore/overheard.html'

/** Overheard version */
export const OVERHEARD_VERSION = 'v0.0.0'

/** No reports message */
export const OVERHEARD_NO_REPORTS = 'There are no reports of glowing or dark scrolls.'

/** School names by color */
export const OVERHEARD_ORB_NAMES: Record<OrbName, SchoolName> = {
  black: 'evocation',
  blue: 'illusion',
  cyan: 'abjuration',
  green: 'enchantment',
  purple: 'transmutation',
  red: 'necromancy',
  white: 'divination',
  yellow: 'conjuration',
}
