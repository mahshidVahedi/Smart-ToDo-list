import { describe, it, expect } from 'vitest'
import moment from 'moment-jalaali'

import {
  getToday,
  addDays,
  getNextWeekday,
  toShamsi,
  normalizeDigits,
  isBeforeToday,
  fromShamsi,
} from '../../../src/utils/nlp/utils' 

describe('jalaali utils', () => {


  it('addDays باید به‌درستی روزها را اضافه کند', () => {
    const base = moment('2025-09-01', 'YYYY-MM-DD')
    const res = addDays(base, 3)
    expect(res.format('YYYY-MM-DD')).toBe('2025-09-04')
  })

  it('getNextWeekday: دوشنبه‌ی بعد از امروز را برگرداند (بدون تغییر امروز)', () => {
    const nextMon = getNextWeekday(1) 
    const today = moment()
    const diff = nextMon.clone().startOf('day').diff(today.clone().startOf('day'), 'days')
    expect(diff).toBeGreaterThan(0)
    expect(diff).toBeLessThanOrEqual(7)
  })

  it('toShamsi و fromShamsi باید round-trip یک روز را حفظ کنند', () => {
    const g = moment('2025-03-21', 'YYYY-MM-DD') 
    const sh = toShamsi(g)
    const back = fromShamsi(sh)
    expect(back.format('YYYY-MM-DD')).toBe(g.format('YYYY-MM-DD'))
  })

  it('normalizeDigits ارقام فارسی/عربی را به لاتین تبدیل کند', () => {
    expect(normalizeDigits('۰۱۲۳۴۵۶۷۸۹')).toBe('0123456789')
    expect(normalizeDigits('٠١٢٣٤٥٦٧٨٩')).toBe('0123456789')
    expect(normalizeDigits('کلاس ساعت ٩:٣٠')).toBe('کلاس ساعت 9:30')
  })

  it('isBeforeToday: تاریخ شمسی دیروز → true، امروز/فردا → false', () => {
    const today = moment().startOf('day')
    const ySh = today.clone().subtract(1, 'day').format('jYYYY/jMM/jDD')
    const tSh = today.clone().format('jYYYY/jMM/jDD')
    const fSh = today.clone().add(1, 'day').format('jYYYY/jMM/jDD')

    expect(isBeforeToday(ySh)).toBe(true)
    expect(isBeforeToday(tSh)).toBe(false)
    expect(isBeforeToday(fSh)).toBe(false)
  })


})
