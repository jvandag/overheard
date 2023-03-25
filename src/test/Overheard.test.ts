/* eslint-disable @typescript-eslint/dot-notation */

import { JSDOM } from 'jsdom'
import { Overheard } from '../Overheard'

import { OVERHEARD_URL, OVERHEARD_SCHOOL_NAMES } from '../util/variables'

describe('Overheard', () => {
  it('Should parse online.', () => {
    const n = new Overheard()['parseOnline'](
      'There are 70 champions adventuring across the realms today, more or less.',
    )
    expect(n).not.toBeNaN()
    expect(n).toBeGreaterThan(0)
  })

  it('Should parse moon phase.', () => {
    const parseMoon = new Overheard()['parseMoon']
    expect(parseMoon('The moon is nearly new.')).toBe('nearly_new')
  })

  it('Should parse scrolls.', () => {
    const parseScrolls = new Overheard()['parseScrolls']
    expect(
      parseScrolls(
        'Rumor has it that evocation, transmutation, and necromancy scrolls are dark.',
      ),
    ).toStrictEqual([
      { name: 'evocation', phase: 'dark' },
      { name: 'transmutation', phase: 'dark' },
      { name: 'necromancy', phase: 'dark' },
    ])
  })

  it('Should fetch dom.', async () => {
    const fetchDOM = new Overheard()['fetchDOM']
    await expect(fetchDOM(OVERHEARD_URL)).resolves.toBeInstanceOf(JSDOM)
  })

  it('Should emit events', async () => {
    const cbScrollsMock = jest.fn()
    const cbMoonMock = jest.fn()
    const cbOnlineMock = jest.fn()

    // Start
    new Overheard(
      {},
      {
        moon: null,
        online: null,
        scrolls: Object.values(OVERHEARD_SCHOOL_NAMES).reduce(
          (acc, cur) => ({ ...acc, [cur]: 'dark' }),
          {},
        ),
      },
    )
      .on('scrolls', cbScrollsMock)
      .on('moon', cbMoonMock)
      .on('online', cbOnlineMock)
      .on('done', () => {
        expect(cbMoonMock).toHaveBeenCalledWith(
          expect.stringMatching(
            /^(new|waxing_crescent|first_quarter|waxing_gibbous|nearly_full|full|waning_gibbous|third_quarter|waning_crescent|nearly_new)$/,
          ),
        )
        expect(cbOnlineMock).toHaveBeenCalledWith(
          expect.arrayContaining([expect.any(Number), null]),
        )
        expect(cbScrollsMock).toHaveBeenCalledWith(expect.any(Array))
      })
      .start()
  })
})
