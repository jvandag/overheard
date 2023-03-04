import { EventEmitter } from 'events'
import { JSDOM } from 'jsdom'
import {
  OVERHEARD_NO_REPORTS,
  OVERHEARD_ORB_NAMES,
  OVERHEARD_URL,
  OVERHEARD_VERSION,
} from './util/variables'

import type {
  GameState,
  MoonPhase,
  OrbPhase,
  OverheardCache,
  OverheardEvent,
  OverheardOptions,
  SchoolName,
} from '../types/index'

/**
 * Simple overheard scraper
 * @class
 */
export class Overheard extends EventEmitter {
  readonly _cache: OverheardCache
  readonly _interval: number
  readonly _quiet: boolean
  timeout?: NodeJS.Timeout

  /**
   * Create new overheard instance
   * @param opts  - Scraper opts
   * @param cache - Stored values
   */
  constructor(opts?: Partial<OverheardOptions>, cache: Partial<OverheardCache> = {}) {
    super()
    this._cache = {
      online: 0,
      scrolls: Object.values(OVERHEARD_ORB_NAMES).reduce(
        (acc: OverheardCache['scrolls'], cur) => ({ ...acc, [cur]: 'normal' }),
        // eslint-disable-next-line
        {} as any,
      ),
      ...cache,
    }
    this._interval = opts?.time ?? 10e3
    this._quiet = opts?.quiet ?? true
  }

  /**
   * Create instance from command-line options
   * @returns - Overheard instance
   */
  static async fromCLI(): Promise<Overheard> {
    const { Command } = await import('commander')
    const { timeunit } = await import('./util/cli/timeunit')
    return await new Promise((resolve, reject) => {
      const app = new Command('overheard')
      app
        .option('-t, --time <time>', 'scan interval', timeunit)
        .option('-q, --quiet', 'disable output', false)
        .version(OVERHEARD_VERSION, '-v, --version')
        .action((opts) => {
          resolve(new this(opts))
        })
        .parse()
    })
  }

  /**
   * Emit event
   * @param name
   * @param arg
   * @returns
   */
  emit<T extends keyof OverheardEvent>(name: T, arg: OverheardEvent[T]): boolean {
    return super.emit(name, arg)
  }

  /**
   * Add event listener
   * @param name - Event name
   * @param listener - Event listener
   * @returns
   */
  on<T extends keyof OverheardEvent>(name: T, listener: (arg: OverheardEvent[T]) => void): this {
    return super.on(name, listener)
  }

  /**
   * Add single use event listener
   * @param name - Event name
   * @param listener - Event listener
   * @returns
   */
  once<T extends keyof OverheardEvent>(name: T, listener: (arg: OverheardEvent[T]) => void): this {
    return super.once(name, listener)
  }

  /**
   * Remove event listener
   * @param name - Event name
   * @param listener - Event listener
   * @returns
   */
  removeListener<T extends keyof OverheardEvent>(name: T, listener: (arg: any) => void): this {
    return super.removeListener(name, listener)
  }

  /**
   * Fetch dom from url
   * @param url - Page url
   * @returns
   */
  async fetchDOM(url: string): Promise<JSDOM> {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`[${res.status}] ${res.statusText}`)
    }
    return new JSDOM(await res.text())
  }

  /**
   * Parse online champions
   * @param line
   * @returns
   */
  parseOnline(line: string): number {
    const match = /(\d+)/g.exec(line)
    if (match === null || isNaN(parseInt(match[1], 10))) {
      throw new Error('Failed to parse online champions!')
    }
    return parseInt(match[1], 10)
  }

  /**
   * Parse moon state
   * @param line
   * @returns
   */
  parseMoon(line: string): MoonPhase {
    const match = /^The\smoon\sis\sa\s(.*?)\.$/.exec(line)
    if (match === null) {
      throw new Error('Failed to parse moon!')
    }
    return match[1].toLowerCase().replace(/\s/g, '_') as MoonPhase
  }

  /**
   * Parse scroll states
   * @param line
   * @returns
   */
  parseScrolls(line: string): GameState['scrolls'] {
    if (line === OVERHEARD_NO_REPORTS) {
      return (Object.entries(this._cache.scrolls) as Array<[SchoolName, OrbPhase]>)
        .filter((s) => s[1] === 'normal')
        .map((s) => ({ name: s[0], phase: 'normal' }))
    }
    const match = /^Rumor\shas\sit\sthat\s(.*?)\sscrolls\sare\s(glowing|dark)\.$/.exec(line)
    if (match === null) {
      throw new Error('Failed to parse scrolls!')
    }
    const phase = match[2] as OrbPhase
    return match[1].split('and').map((v) => ({
      name: v.trim().toLowerCase() as SchoolName,
      phase,
    }))
  }

  /**
   * Parse Overheard
   * @param dom - Page dom
   * @returns   - Game state
   */
  parse(dom: JSDOM): GameState {
    const document = dom.window.document
    const lines = Array.from(document.querySelector('div:nth-child(2)')?.childNodes ?? [])
      .filter((e) => e.nodeName === '#text')
      .map((e) => e.textContent) as string[]
    if (lines.length > 3) {
      throw new Error('Failed to fetch text!')
    }
    return {
      moon: this.parseMoon(lines[1]),
      online: this.parseOnline(lines[0]),
      scrolls: this.parseScrolls(lines[2]),
    }
  }

  /** Scraper loop */
  next(): void {
    this.fetchDOM(OVERHEARD_URL)
      .then((dom) => this.parse(dom))
      .then((newState) => {
        if (newState.moon !== this._cache.moon) {
          this.emit('moon', newState.moon)
          this._cache.moon = newState.moon
        }
        if (newState.online !== this._cache.online) {
          this.emit('online', [newState.online, this._cache.online])
          this._cache.online = newState.online
        }
        if (newState.scrolls.some((s) => this._cache.scrolls[s.name] !== s.phase)) {
          this.emit('scrolls', newState.scrolls)
          newState.scrolls.forEach((s) => {
            this._cache.scrolls[s.name] = s.phase
          })
        }
        // Schedule next scan
        this.timeout = setTimeout(() => {
          this.next()
        }, this._interval)
      })
      .catch((err) => {
        if (err instanceof Error) {
          console.error(err.message)
        }
      })
  }
}
