import { describe, it, expect } from 'vitest'
import { parsePersianTask } from '../../../src/utils/nlp'

describe('NLP - split & ranges', () => {
  it('اسپلیت با "و" و ویرگول', async () => {
    const r = await parsePersianTask('مطالعه و تمرین، خرید، و جلسه مهم')
    expect(r).toHaveLength(4)
    expect(r.map(t => t.title)).toEqual(['مطالعه', 'تمرین', 'خرید', 'جلسه'])
  })

  it('اسپلیت با عربیک‌کاما + "و"', async () => {
    const r = await parsePersianTask('پشتیبان‌گیری، ایمیل، و ارسال فاکتور')
    expect(r.map(t => t.title)).toEqual(['پشتیبان‌گیری', 'ایمیل', 'ارسال فاکتور'])
  })

  it('بازه‌های دوتایی → دو تسک', async () => {
    const r = await parsePersianTask('مطالعه ساعت ۸ تا ۹ و ورزش ساعت ۱۰ تا ۱۱')
    expect(r).toHaveLength(2)
    expect(r[0].title).toBe('مطالعه')
    expect(r[0].timeRange?.from || r[0].time).toBe('08:00')
    expect(r[1].title).toBe('ورزش')
    expect(r[1].timeRange?.from || r[1].time).toBe('10:00')
  })

  it('نباید کلمات مرکب با "و" داخلی را بشکند', async () => {
    const r = await parsePersianTask('یادآوری سه‌شنبه هفته بعد ساعت ۹')
    expect(r).toHaveLength(1)
    expect(r[0].title).toBe('یادآوری')
    expect(r[0].date).toBeDefined()
  })

  it('بازه با قید شب: "از ۸ تا ۹ شب"', async () => {
    const r = await parsePersianTask('مطالعه از ساعت ۸ تا ۹ شب')
    expect(r[0].title).toBe('مطالعه')
    expect(r[0].timeRange.from).toBe('20:00')
    expect(r[0].timeRange.to).toBe('21:00')
  })
})