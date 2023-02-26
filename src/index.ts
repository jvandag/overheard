#!/usr/bin/env node

import { JSDOM } from 'jsdom'
import { EventEmitter } from 'events'

import { OVERHEARD_URL, OVERHEARD_VERSION } from './variables'
import type { OrbName, OrbPhase, OverheardEvents, OverheardOptions } from './types'

/**
 * Overheard scraper
 * @class
 */
export class Overheard extends EventEmitter {
  readonly _cache: Map<OrbName, OrbPhase>
  readonly _quiet: boolean
  readonly _interval: number
  readonly _version: string = OVERHEARD_VERSION

  constructor(opts?: Partial<OverheardOptions>) {
    super()
    this._cache = new Map()
    this._quiet = opts?.quiet ?? true
    this._interval = opts?.interval ?? -1
  }

  /**
   * Create app from cli
   * @param argv - Arguments
   * @returns    - Configured class
   */
  static async cli(argv: string[]): Promise<Overheard> {
    const { Command, CommanderError } = await import('commander')
    const units: Record<string, number> = {
      s: 1e3,
      m: 6e3,
      h: 36e6,
      d: 8.64e7,
    }

    /**
     * Create new selection
     * @param options - Allowed options
     * @returns       - Selection callback
     */
    const selection = (options: string[]): ((input: string) => string) => {
      return (input) => {
        if (options.includes(input.toLowerCase())) {
          return input.toLowerCase()
        }
        throw new CommanderError(1, '', `Invalid selection: "${input}"!`)
      }
    }

    /**
     * Convert time string to ms
     * @param input - Time string
     * @returns     - Value in ms
     * @example
     * timeunit('1s')
     */
    const timeunit = (input: string): number => {
      const match = /(\d*\.?\d*)(d|s|h|m)/.exec(input)
      if (match !== null && !isNaN(parseFloat(match[1])) && !isNaN(units[match[2]])) {
        return parseFloat(match[1]) * units[match[2]]
      }
      throw new CommanderError(1, '', `Failed to parse interval time: "${input}"!`)
    }

    return await new Promise((resolve, reject) => {
      const app = new Command('overheard')
      if (!process.stdout.isTTY) {
        reject(new Error('STDOUT is not a tty!'))
      }
      app
        .option('-i, --interval <time>', 'scan interval.', timeunit, -1)
        .option('-o, --output <type>', 'output format.', selection(['csv', 'json', 'print']))
        .option('-q, --quiet', 'disable output.', false)
        .version(OVERHEARD_VERSION, '-v, --version')
        .action((opts) => {
          resolve(new this(opts))
        })
        .parse(argv)
    })
  }

  /**
   * Emit event
   * @param name
   * @param args
   * @returns
   */
  emit<T extends keyof OverheardEvents>(name: T, ...args: OverheardEvents[T]): boolean {
    return super.emit(name, ...args)
  }

  /**
   * Listen for event
   * @param name
   * @param listener
   * @returns
   */
  on<T extends keyof OverheardEvents>(
    name: T,
    listener: (...args: OverheardEvents[T]) => void,
  ): this {
    return super.on(name, listener as any)
  }

  /**
   * Fetch overheard
   * @returns - Page HTML
   */
  async fetch(): Promise<string> {
    const res = await fetch(OVERHEARD_URL, { method: 'GET' })
    if (!res.ok) {
      throw new Error(`[${res.status}]: ${res.statusText}`)
    }
    return await res.text()
  }

  /**
   * Parse overheard page
   * @param html - Page HTML
   * @returns    - Game state
   */
  parse(html: string): JSDOM {
    const dom = new JSDOM(html)
    const document = dom.window.document
    return dom
  }

  /** Scraper loop */
  next(): void {
    this.fetch()
      .then(this.parse)
      .then((dom) => {
        console.log(dom.serialize())
      })
      .catch((err) => {
        throw err
      })
    if (this._interval > 1) {
      setTimeout(() => {
        this.next()
      }, this._interval)
    }
  }
}

// Main
if (require.main === module) {
  Overheard.cli(process.argv)
    .then((heard) => heard.next())
    .catch((err) => {
      throw err
    })
}
