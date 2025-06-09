import { getToday, addDays, getNextWeekday, toShamsi, fromShamsi, isBeforeToday } from './utils'
import moment from 'moment-jalaali'

const weekdayMap = {
  'دوشنبه': 1,
  'سه‌شنبه': 2,
  'چهارشنبه': 3,
  'پنج‌شنبه': 4,
  'پنجشنبه': 4,
  'جمعه': 5,
  'شنبه': 6,
  'یکشنبه': 7
}

export function extractDate(text) {
  const normalized = text

  if (/امروز/.test(normalized)) {
    const date = toShamsi(getToday())
    return { date, repeat: '', isExplicit: false }
  }
  if (/امشب/.test(normalized)) {
    const date = toShamsi(getToday())
    return { date, repeat: '', isExplicit: false }
  }

  if (/فردا/.test(normalized)) {
    const date = toShamsi(addDays(getToday(), 1))
    return { date, repeat: '', isExplicit: false }
  }

  if (/پس‌فردا/.test(normalized)) {
    const date = toShamsi(addDays(getToday(), 2))
    return { date, repeat: '', isExplicit: false }
  }

  const matchWeekdayNext = normalized.match(
    /(سه‌شنبه|چهارشنبه|پنج‌شنبه|پنجشنبه|یکشنبه|دوشنبه|جمعه|شنبه)\s*(ی)?\s*(هفته\s*بعد|هفته\s*آینده)/
  )
  if (matchWeekdayNext) {
    const weekday = weekdayMap[matchWeekdayNext[1]]
    const date = toShamsi(getNextWeekday(weekday))
    return { date, repeat: '', isExplicit: true }
  }

  const matchRelative = normalized.match(/(\d{1,2})\s*(روز|هفته)\s*(دیگر|بعد)/)
  if (matchRelative) {
    const amount = parseInt(matchRelative[1])
    const unit = matchRelative[2] === 'هفته' ? 7 : 1
    const date = toShamsi(addDays(getToday(), amount * unit))
    return { date, repeat: '', isExplicit: false }
  }

  const matchShamsi = normalized.match(
    /(\d{1,2})\s*(فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند)/
  )
  if (matchShamsi) {
    const day = matchShamsi[1].padStart(2, '0')
    const monthMap = {
      فروردین: '01', اردیبهشت: '02', خرداد: '03', تیر: '04',
      مرداد: '05', شهریور: '06', مهر: '07', آبان: '08',
      آذر: '09', دی: '10', بهمن: '11', اسفند: '12'
    }
    const month = monthMap[matchShamsi[2]]
    const year = toShamsi(getToday()).split('/')[0]
    return { date: `${year}/${month}/${day}`, repeat: '', isExplicit: true }
  }

  return { date: null, repeat: null, isExplicit: false }
}

export function getNextDate(shamsiDateOrNull, repeat) {
  const base = shamsiDateOrNull && !isBeforeToday(shamsiDateOrNull)
    ? fromShamsi(shamsiDateOrNull)
    : moment(); 

  if (repeat === 'daily') {
    return base.add(1, 'day').format('jYYYY/jMM/jDD');
  }

  if (repeat === 'weekly') {
    return base.add(7, 'day').format('jYYYY/jMM/jDD');
  }

  return null;
}

