/* eslint-disable @typescript-eslint/dot-notation */

import { Overheard } from '../Overheard'
import type { MoonPhase, ScrollState } from 'types'

const OVERHEARD_NOTHING =
  '<html><head><title>Overheard</title></head><body bgcolor="#f5f3e4"><div align="center"><h1>Overheard in Tavelor\'s Tavern</h1></div><div align="left">There are 70 champions adventuring across the realms today, more or less.<br><br>The moon is a waning gibbous.<br><br>There are no reports of glowing or dark scrolls.<br><br></body></html>'

const OVERHEARD_GLOWING =
  '<html><head><title>Overheard</title></head><body bgcolor="#f5f3e4"><div align="center"><h1>Overheard in Tavelor\'s Tavern</h1></div><div align="left">There are 70 champions adventuring across the realms today, more or less.<br><br>The moon is a waning gibbous.<br><br>Rumor has it that necromancy and conjuration scrolls are glowing.<br><br></body></html>'

describe('Overheard.', () => {
  it('Should parse properties', () => {
    const overheard = new Overheard({})
    const res = overheard['parse'](OVERHEARD_GLOWING)
    expect(res).toStrictEqual({
      online: 70,
      moon: 'waning_gibbous',
      scrolls: [
        { name: 'necromancy', phase: 'glowing' },
        { name: 'conjuration', phase: 'glowing' },
      ],
    })
  })

  it('Should emit events', (done) => {
    const overheard = new Overheard({})
    let online: number
    let moon: MoonPhase
    let scrolls: ScrollState[]
    overheard
      .once('scrolls', (s) => {
        scrolls = s
      })
      .once('online', (o) => {
        online = o
      })
      .once('moon', (phase) => {
        moon = phase
      })
      .once('done', () => {
        expect(scrolls).toStrictEqual([
          { name: 'necromancy', phase: 'glowing' },
          { name: 'conjuration', phase: 'glowing' },
        ])
        expect(moon).toBe('waning_gibbous')
        expect(online).toBe(70)
        done()
      })
    overheard['diff'](overheard['parse'](OVERHEARD_GLOWING))
    overheard.emit('done', undefined)
  })

  it('Should return to normal', (done) => {
    const overheard = new Overheard(
      {},
      {
        scrolls: {
          necromancy: 'dark',
          conjuration: 'dark',
        },
      },
    )
    overheard.once('scrolls', (scrolls) => {
      expect(scrolls).toStrictEqual([
        { name: 'necromancy', phase: 'normal' },
        { name: 'conjuration', phase: 'normal' },
      ])
      done()
    })
    overheard['diff'](overheard['parse'](OVERHEARD_NOTHING))
  })
})
