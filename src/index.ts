#!/usr/bin/env node

import { Overheard } from './Overheard'

// Main
if (require.main === module) {
  Overheard.fromCLI()
    .then((overheard) => {
      if (!overheard._quiet) {
        overheard
          .on('moon', (state) => {
            console.log(`moon: ${state}`)
          })
          .on('online', (count) => {
            console.log(`online: ${count.join(' ')}`)
          })
          .on('scrolls', (state) => {
            console.log(state.map((s) => `scroll: ${s.name} ${s.phase}`).join('\n'))
          })
      }
      overheard.next()
    })
    .catch((err) => {
      throw err
    })
}

export default Overheard
export * from './Overheard'
export * from './util/variables'
