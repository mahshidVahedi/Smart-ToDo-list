import { describe, it, expect } from 'vitest'
import { parsePersianTask } from '../../../src/utils/nlp'

describe('NLP - Persian Task Parsing (basic & noise)', () => {
  it('ساده با بازه‌زمان و کلمه‌ی دوره: "مطالعه شب ساعت ۸ تا ۹"', async () => {
    const r = await parsePersianTask('مطالعه شب ساعت ۸ تا ۹')
    expect(r).toHaveLength(1)
    expect(r[0].title).toBe('مطالعه')
    expect(r[0].timeRange).toBeDefined()
    expect(r[0].date).toBeDefined()
  })

  it('ورودی خالی → []', async () => {
    const r = await parsePersianTask('')
    expect(r).toEqual([])
  })

  it('بدون زمان/تاریخ → عنوان می‌ماند و تاریخ پیش‌فرض ست می‌شود', async () => {
    const r = await parsePersianTask('یادآوری خرید')
    expect(r[0].title).toBe('یادآوری خرید')
    expect(r[0].date).toBeDefined()
  })

  it('حروف اضافه/نویز و فاصله‌های اضافه پاک شوند', async () => {
    const r = await parsePersianTask('  خرید   !!! در ۳ مهر ')
    expect(r[0].title).toBe('خرید')
    expect(r[0].date).toMatch(/^1404\//)
  })

  it('اعداد یکنواخت شوند (نیم‌فاصله/تمام‌فاصله): "٩" → 09:00', async () => {
    const r = await parsePersianTask('یادآوری قسط در ۵ آبان ساعت ٩')
    expect(r[0].date).toMatch(/^1404\/08\/05$/)
    expect(r[0].timeRange?.from || r[0].time).toBe('09:00')
  })

  it('اعداد یا مقادیر مشکل‌دار باعث کرش نشوند', async () => {
    const r = await parsePersianTask('دوشنبه ۹۹۹۹۹۹ ساعت ۲۵')
    expect(r[0].title).toContain('دوشنبه')
  })

  it('اعداد یتیم در عنوان حذف شوند', async () => {
    const r = await parsePersianTask('مطالعه ساعت ۸ تا ۹')
    expect(r[0].title).toBe('مطالعه')
  })
})