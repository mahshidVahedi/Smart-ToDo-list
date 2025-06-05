import { describe, it, expect } from 'vitest'
import { parsePersianTask } from '../src/utils/nlp'

describe('NLP - Persian Task Parsing', () => {

  it('should parse a simple task with time and period word', async () => {
    const result = await parsePersianTask('مطالعه شب ساعت ۸ تا ۹')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('مطالعه')
    expect(result[0].timeRange).toBeDefined()
    expect(result[0].date).toBeDefined()
  })

  it('should split multiple tasks and clean both', async () => {
    const result = await parsePersianTask('مطالعه شب و خرید شنبه ساعت ۱۰')
    expect(result).toHaveLength(2)
    expect(result[0].title).toBe('مطالعه')
    expect(result[1].title).toBe('خرید')
    expect(result[1].date).toBeDefined()
  })

  it('should not split compound words with internal "و"', async () => {
    const result = await parsePersianTask('یادآوری سه‌شنبه هفته بعد ساعت ۹')
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('یادآوری')
    expect(result[0].date).toBeDefined()
  })

  it('should extract and format explicit Shamsi date', async () => {
    const result = await parsePersianTask('جلسه ۲۵ تیر ساعت ۱۰')
    expect(result).toHaveLength(1)
    expect(result[0].date).toMatch(/^1404\/04\/25$/)
    expect(result[0].title).toBe('جلسه')
  })

  it('should extract repeat info and clean title when repeated', async () => {
    const result = await parsePersianTask('جلسه مهم هر دوشنبه عصر ساعت ۴ تا ۶ در ۲۵ تیر')
    expect(result).toHaveLength(1)
    expect(result[0].repeat).toBe('weekly')
    expect(result[0].title).toBe('جلسه')
  })

  it('should remove priority words when result.priority is true', async () => {
    const result = await parsePersianTask('جلسه خیلی فوری شب ساعت ۹', { priority: true })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('جلسه')
  })

  it('should clean orphaned numbers in title', async () => {
    const result = await parsePersianTask('مطالعه ساعت ۸ تا ۹')
    expect(result[0].title).toBe('مطالعه')
  })
  it('should handle empty input gracefully', async () => {
    const result = await parsePersianTask('')
    expect(result).toEqual([])
  })

  it('should fallback when no time/date is present', async () => {
    const result = await parsePersianTask('یادآوری خرید')
    expect(result[0].title).toBe('یادآوری خرید')
    expect(result[0].date).toBeDefined()
  })

  it('should handle noisy characters and extra spaces', async () => {
    const result = await parsePersianTask('  خرید   !!! در ۳ مرداد ')
    expect(result[0].title).toBe('خرید')
    expect(result[0].date).toMatch(/^1404\//)
  })

  it('should not crash with invalid weekday and time', async () => {
    const result = await parsePersianTask('دوشنبه ۹۹۹۹۹۹ ساعت ۲۵')
    expect(result[0].title).toContain('دوشنبه')
  })

  it('should split tasks using comma and و', async () => {
    const result = await parsePersianTask('مطالعه و تمرین، خرید، و جلسه مهم')
    expect(result).toHaveLength(4)
    expect(result[0].title).toBe('مطالعه')
    expect(result[1].title).toBe('تمرین')
    expect(result[2].title).toBe('خرید')
    expect(result[3].title).toBe('جلسه')
  })
})


it('should parse a task with specific time range and title', async () => {
  const result = await parsePersianTask('مطالعه از ساعت ۸ تا ۹ شب')
  expect(result[0].title).toBe('مطالعه')
  expect(result[0].timeRange.from).toBe('20:00')
  expect(result[0].timeRange.to).toBe('21:00')
})

it('should handle task without time or date', async () => {
  const result = await parsePersianTask('بازبینی قراردادها')
  expect(result[0].title).toBe('بازبینی قراردادها')
  expect(result[0].date).toBeDefined()
})

it('should split tasks with comma and "و"', async () => {
  const result = await parsePersianTask('پشتیبان‌گیری، ایمیل، و ارسال فاکتور')
  const titles = result.map(t => t.title)
  expect(titles).toEqual(['پشتیبان‌گیری', 'ایمیل', 'ارسال فاکتور'])
})


it('should extract "next week" and convert to correct date', async () => {
  const result = await parsePersianTask('یادآوری وام سه‌شنبه هفته بعد ساعت ۱۰')
  expect(result[0].title).toBe('یادآوری وام')
  expect(result[0].date).toBeDefined()
})

it('should distinguish priority from context (not part of title)', async () => {
  const result = await parsePersianTask('جلسه خیلی مهم با مدیرعامل سه‌شنبه')
  expect(result[0].title).toBe('جلسه با مدیرعامل')
})

it('should parse tasks with embedded Arabic script words (کلمات عربی)', async () => {
  const result = await parsePersianTask('پیگیری مکاتبه با دانشگاه در ۱ مرداد')
  expect(result[0].title).toBe('پیگیری مکاتبه با دانشگاه')
  expect(result[0].date).toBe('1404/05/01')
})
it('should parse multiple tasks with different structures', async () => {
  const result = await parsePersianTask('خرید صبح، جلسه تیم ساعت ۱۰ تا ۱۱')
  expect(result).toHaveLength(2)
  expect(result[0].title).toBe('خرید')
  expect(result[1].title).toBe('جلسه تیم')
  expect(result[1].timeRange?.from || result[1].time).toBe('10:00')
})

it('should extract recurring pattern with day and time', async () => {
  const result = await parsePersianTask('هر دوشنبه ساعت ۱۶ جلسه هفتگی تیم')
  expect(result[0].title).toBe('جلسه هفتگی تیم')
  expect(result[0].repeat).toBe('weekly')
  expect(result[0].timeRange?.from || result[0].time).toBe('16:00')
})

it('should parse task with explicit Shamsi date', async () => {
  const result = await parsePersianTask('گزارش مالی ۲۵ تیر ساعت ۹')
  expect(result[0].title).toBe('گزارش مالی')
  expect(result[0].date).toBe('1404/04/25')
  expect(result[0].timeRange?.from || result[0].time).toBe('09:00')
})

it('should trim and clean title from surrounding words', async () => {
  const result = await parsePersianTask('برگزاری جلسه فوری ساعت ۱۴')
  expect(result[0].title).toBe('جلسه')
  expect(result[0].timeRange?.from || result[0].time).toBe('14:00')
})

it('should parse compound date + weekday without conflict', async () => {
  const result = await parsePersianTask('جلسه با مدیر در ۲۵ تیر سه‌شنبه ساعت ۹')
  expect(result[0].title).toBe('جلسه با مدیر')
  expect(result[0].date).toBe('1404/04/25')
  expect(result[0].timeRange?.from || result[0].time).toBe('09:00')
})

it('should detect double time ranges and split if necessary', async () => {
  const result = await parsePersianTask('مطالعه ساعت ۸ تا ۹ ، ورزش ساعت ۱۰ تا ۱۱')
  expect(result).toHaveLength(2)
  expect(result[0].title).toBe('مطالعه')
  expect(result[0].timeRange?.from || result[0].time).toBe('08:00')
  expect(result[1].title).toBe('ورزش')
  expect(result[1].timeRange?.from || result[1].time).toBe('10:00')
})

it('should normalize half-width and full-width digits', async () => {
  const result = await parsePersianTask('یادآوری قسط در ۵ مرداد ساعت ٩')
  expect(result[0].date).toMatch(/^1404\/05\/05$/)
  expect(result[0].timeRange?.from || result[0].time).toBe('09:00')
})
