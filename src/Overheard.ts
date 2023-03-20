import { EventEmitter } from 'events'
import { JSDOM } from 'jsdom'
import fetch from 'isomorphic-fetch'
import {
  OVERHEARD_NO_REPORTS,
  OVERHEARD_URL,
  OVERHEARD_VERSION,
} from './util/variables'

import type {
  GameState,
  MoonPhase,
  Options,
  OrbPhase,
  OverheardCache,
  OverheardEvent,
  OverheardOptions,
  SchoolName,
  ScrollState,
} from '../types/index'

/**
 * Simple overheard scraper
 * @class
 */
export class Overheard extends EventEmitter {
  private readonly _cache: OverheardCache
  private readonly _interval: number
  private timeout?: NodeJS.Timeout

  /**
   * Create new overheard instance
   * @param opts  - Scraper opts
   * @param cache - Stored values
   */
  constructor(opts?: Partial<Options>, cache: Partial<OverheardCache> = {}) {
    super()
    this._cache = {
      online: null,
      moon: null,
      scrolls: {},
      ...cache,
    }
    this._interval = opts?.time ?? Infinity
  }

  /**
   * Create instance from command-line options
   * @returns - Overheard instance & options
   */
  static async fromCLI(): Promise<[Overheard, OverheardOptions]> {
    const { Command } = await import('commander')
    const { timeunit } = await import('./util/cli/timeunit')
    return await new Promise((resolve, reject) => {
      const app = new Command('overheard')
      app
        .option('-t, --time <time>', 'scan interval', timeunit)
        .option('-q, --quiet', 'disable output', false)
        .version(OVERHEARD_VERSION, '-v, --version')
        .action((opts) => {
          resolve([new this(opts), opts])
        })
        .parse()
    })
  }

  /**
   * Fetch DOM from url
   * @param url - Page url
   * @returns   - Page DOM
   */
  private async fetchDOM(url: string): Promise<JSDOM> {
    const res = await fetch(url)
    if (!res.ok) {
      throw new Error(`[${res.status}] ${res.statusText}`)
    }
    return new JSDOM(await res.text())
  }

  /**
   * Parse online champions
   * @param line - Text input
   * @returns - Online players
   */
  private parseOnline(line: string): number {
    const match = /(\d+)/g.exec(line)
    if (match === null || isNaN(parseInt(match[1], 10))) {
      throw new Error('Failed to parse online champions!')
    }
    return parseInt(match[1], 10)
  }

  /**
   * Parse moon state
   * @param line - Text input
   * @returns - Moon state
   */
  private parseMoon(line: string): MoonPhase {
    const match = /^The\smoon\sis\s((in\sits|a)\s)?(.*?)\.$/.exec(line)
    if (match === null) {
      throw new Error('Failed to parse moon!')
    }
    return match[3].toLowerCase().replace(/\s/g, '_') as MoonPhase
  }

  /**
   * Parse scroll states
   * @param line - Text input
   * @returns - Changed scrolls
   */
  private parseScrolls(line: string): ScrollState[] {
    if (line === OVERHEARD_NO_REPORTS) {
      const entries: Array<[SchoolName, OrbPhase]> = Object.entries(
        this._cache.scrolls,
      ) as any
      if (entries.some((c) => c[1] !== 'normal')) {
        return entries
          .filter((c) => c[1] !== 'normal')
          .map((c) => ({ name: c[0], phase: 'normal' }))
      }
      return []
    }
    const match =
      /^Rumor\shas\sit\sthat\s(.*?)\sscrolls\sare\s(glowing|dark)\.$/.exec(line)
    if (match === null) {
      throw new Error('Failed to parse scrolls!')
    }
    const phase = match.pop()?.toLowerCase() as OrbPhase
    return match[1]
      .replace('and', '')
      .split(',')
      .map((n) => ({
        name: n.trim().toLowerCase() as SchoolName,
        phase,
      }))
  }

  /**
   * Parse Overheard DOM
   * @param dom - Page dom
   * @returns   - Game state
   */
  private parse(dom: JSDOM): GameState {
    const document = dom.window.document
    const lines = Array.from(
      document.querySelector('div:nth-child(2)')?.childNodes ?? [],
    )
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

  /**
   * Emit event
   * @param name
   * @param arg
   * @returns
   */
  emit<T extends keyof OverheardEvent>(
    name: T,
    arg: OverheardEvent[T],
  ): boolean {
    return super.emit(name, arg)
  }

  /**
   * Add event listener
   * @param name - Event name
   * @param listener - Event listener
   * @returns
   */
  on<T extends keyof OverheardEvent>(
    name: T,
    listener: (arg: OverheardEvent[T]) => void,
  ): this {
    return super.on(name, listener)
  }

  /**
   * Add single use event listener
   * @param name - Event name
   * @param listener - Event listener
   * @returns
   */
  once<T extends keyof OverheardEvent>(
    name: T,
    listener: (arg: OverheardEvent[T]) => void,
  ): this {
    return super.once(name, listener)
  }

  /**
   * Remove event listener
   * @param name - Event name
   * @param listener - Event listener
   * @returns
   */
  removeListener<T extends keyof OverheardEvent>(
    name: T,
    listener: (arg: any) => void,
  ): this {
    return super.removeListener(name, listener)
  }

  /**
   * Get online members
   * @returns
   */
  online(): number {
    return this._cache.online ?? 0
  }

  /**
   * Get moon phase
   * @returns
   */
  moon(): MoonPhase | null {
    return this._cache.moon
  }

  /**
   * Get scroll's states
   * @returns
   */
  scrolls(): ScrollState[] {
    return (Object.entries(this._cache) as Array<[SchoolName, OrbPhase]>).map(
      ([name, phase]) => ({ name, phase }),
    )
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
        if (
          newState.scrolls.length > 1 &&
          newState.scrolls.some((s) => this._cache.scrolls[s.name] !== s.phase)
        ) {
          this.emit('scrolls', newState.scrolls)
          newState.scrolls.forEach((s) => {
            this._cache.scrolls[s.name] = s.phase
          })
        }
      })
      .finally(() => {
        if (isFinite(this._interval)) {
          this.timeout = setTimeout(() => {
            this.next()
          }, this._interval)
        } else {
          this.emit('done', undefined)
        }
      })
      .catch((err) => {
        if (err instanceof Error) {
          console.error(err.message)
        }
      })
  }

  /** Stop scraper */
  stop(): void {
    clearTimeout(this.timeout)
    // @ts-expect-error - Disable next loop
    this._interval = Infinity
  }

  /** Start scraper */
  start(): this {
    this.next()
    return this
  }
}
