import { CommanderError } from 'commander'

const units: Record<string, number> = {
  s: 1e3,
  m: 6e3,
  h: 36e6,
  d: 8.64e7,
}

/**
 * Parse time string
 * @param input
 * @returns
 */
export const timeunit = (input: string): number => {
  const match = /^(\d+)(s|m|h|d)?$/.exec(input)
  if (match === null) {
    throw new CommanderError(1, '1', `Invalid time: "${input}"!`)
  }
  if (!isNaN(parseFloat(match[1])) && !isNaN(units[match[2]])) {
    return parseFloat(match[1]) * units[match[2]]
  }
  if (!isNaN(parseInt(match[1])) && typeof match[2] === 'undefined') {
    return parseInt(match[1])
  }
  throw new CommanderError(1, '1', `Failed to parse time: "${input}"!`)
}
