/* eslint-disable @typescript-eslint/dot-notation */

import { JSDOM } from 'jsdom'
import { Overheard } from '../Overheard'

import { OVERHEARD_URL } from '../util/variables'

let overheard: Overheard

beforeAll(async () => {
  overheard = new Overheard()
})

describe('Overheard', () => {
  it('Should parse online.', () => {
    const res = overheard['parseOnline'](
      'There are 70 champions adventuring across the realms today, more or less.',
    )
    expect(res).not.toBeNaN()
    expect(res).toBeGreaterThan(0)
  })

  it('Should parse moon phase.', () => {
    const res = overheard['parseMoon']('The moon is nearly new.')
    expect(res).toBe('nearly_new')
  })

  it('Should parse scrolls.', () => {
    const res = overheard['parseScrolls'](
      'Rumor has it that evocation, transmutation, and necromancy scrolls are dark.',
    )
    expect(res).toStrictEqual([
      { name: 'evocation', phase: 'dark' },
      { name: 'transmutation', phase: 'dark' },
      { name: 'necromancy', phase: 'dark' },
    ])
  })

  it('Should fetch dom.', () => {
    expect(overheard['fetchDOM'](OVERHEARD_URL)).resolves.toBeInstanceOf(JSDOM)
  })
})
