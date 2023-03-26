/** Overheard class options */
export interface Options {
  time: number
  headers: Record<string, string>
}

/** Overheard command-line options */
export interface OverheardOptions extends Options {
  quiet: boolean
}
