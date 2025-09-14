import { describe, it, expect } from 'vitest'
import { parsePersianTask } from '../../../src/utils/nlp'

describe('NLP - explicit dates & repeat & title cleaning', () => {
  it('تاریخ شمسی صریح (مثال: "۲۵ دی")', async () => {
    const r = await parsePersianTask('جلسه ۲۵ دی ساعت ۱۰')
    expect(r).toHaveLength(1)
    expect(r[0].title).toBe('جلسه')
    expect(r[0].date).toMatch(/^1404\/10\/25$/)
  })

  it('ترکیب تکرار هفتگی + عصر + بازه + تاریخ درون جمله، عنوان تمیز شود', async () => {
    const r = await parsePersianTask('جلسه مهم هر دوشنبه عصر ساعت ۴ تا ۶ در ۲۵ تیر')
    expect(r).toHaveLength(1)
    expect(r[0].repeat).toBe('weekly')
    expect(r[0].title).toBe('جلسه')
  })

  it('پاکسازی اولویت از عنوان وقتی option.priority=true', async () => {
    const r = await parsePersianTask('جلسه فوری شب ساعت ۹', { priority: true })
    expect(r[0].title).toBe('جلسه')
  })

  it('هفته بعد + ساعت مشخص', async () => {
    const r = await parsePersianTask('یادآوری وام سه‌شنبه هفته بعد ساعت ۱۰')
    expect(r[0].title).toBe('یادآوری وام')
    expect(r[0].date).toBeDefined()
  })

  it('تشخیص اولویت داخل عنوان نباشد', async () => {
    const r = await parsePersianTask('جلسه مهم با مدیرعامل سه‌شنبه')
    expect(r[0].title).toBe('جلسه با مدیرعامل')
  })

  it('ترکیب تاریخ صریح + روز هفته بدون تعارض', async () => {
    const r = await parsePersianTask('جلسه با مدیر در ۲۵ تیر ساعت ۹')
    expect(r[0].title).toBe('جلسه با مدیر')
    expect(r[0].date).toBe('1405/04/25')
    expect(r[0].timeRange?.from || r[0].time).toBe('09:00')
  })

  it('چند ساختار: "خرید صبح، جلسه تیم ۱۰ تا ۱۱"', async () => {
    const r = await parsePersianTask('خرید صبح، جلسه تیم ساعت ۱۰ تا ۱۱')
    expect(r).toHaveLength(2)
    expect(r[0].title).toBe('خرید')
    expect(r[1].title).toBe('جلسه تیم')
    expect(r[1].timeRange?.from || r[1].time).toBe('10:00')
  })

  it('هفتگی با ساعت: "هر دوشنبه ساعت ۱۶ جلسه هفتگی تیم"', async () => {
    const r = await parsePersianTask('هر دوشنبه ساعت ۱۶ جلسه هفتگی تیم')
    expect(r[0].title).toBe('جلسه هفتگی تیم')
    expect(r[0].repeat).toBe('weekly')
    expect(r[0].timeRange?.from || r[0].time).toBe('16:00')
  })

  it('trim و حذف صفت‌های اطراف عنوان', async () => {
    const r = await parsePersianTask('برگزاری جلسه فوری ساعت ۱۴')
    expect(r[0].title).toBe('جلسه')
    expect(r[0].timeRange?.from || r[0].time).toBe('14:00')
  })

  it('کلمات عربی/فارسی در عنوان حفظ شوند + تاریخ صریح', async () => {
    const r = await parsePersianTask('پیگیری مکاتبه با دانشگاه در ۱ مرداد')
    expect(r[0].title).toBe('پیگیری مکاتبه با دانشگاه')
    expect(r[0].date).toBe('1405/05/01')
  })
})