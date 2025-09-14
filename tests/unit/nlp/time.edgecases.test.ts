import { describe, it, expect } from 'vitest'
import { normalizeHour, extractTime, extractTimeRange } from '../../../src/utils/nlp/time' // مسیرت رو چک کن

describe('time sanity ', () => {
  it('normalizeHour: ظهر → 12 / صبح 12 → 0 / عصر 3 → 15', () => {
    expect(normalizeHour('12', 'صبح')).toBe(0)
    expect(normalizeHour('1', 'ظهر')).toBe(12)
    expect(normalizeHour('3', 'عصر')).toBe(15)
  })

  it('extractTime: "ساعت ٩ صبح" → 09:00', () => {
    expect(extractTime('ساعت ٩ صبح')).toBe('09:00')
  })

  it('extractTimeRange: "مطالعه از ساعت ۸ تا ۹ شب" → 20:00..21:00', () => {
    const r = extractTimeRange('مطالعه از ساعت ۸ تا ۹ شب')
    expect(r).toEqual({ from: '20:00', to: '21:00' })
  })
})
