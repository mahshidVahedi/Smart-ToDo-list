import { describe, it, expect } from 'vitest'
import { extractDate } from '../../../src/utils/nlp/date'
import { extractTitle } from '../../../src/utils/nlp/title'
import { extractRepeat } from '../../../src/utils/nlp/repeat'

describe('Smart NLP – ترکیب تاریخ/تکرار/عنوان', () => {
  const text = 'کلاس درس یکشنبه‌ها ساعت ۱۰ صبح'

  it('تاریخ و تکرار از "یکشنبه‌ها" → weekly + تاریخ اولیه', () => {
    const { date, repeat, isExplicit } = extractDate(text)
    expect(date).toMatch(/^\d{4}\/\d{2}\/\d{2}$/)
    expect(repeat).toBe('weekly')
    expect(isExplicit).toBe(true)
  })

  it('عنوان تمیز', () => {
    const result: any = {}
    const title = extractTitle(text, result)
    expect(title).toBe('کلاس درس')
  })

  it('repeat مستقیم', () => {
    expect(extractRepeat(text)).toBe('weekly')
  })
})