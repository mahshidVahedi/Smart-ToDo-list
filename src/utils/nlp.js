// src/utils/nlp.js
import dayjs from 'dayjs'
import jalaliday from 'jalaliday'

dayjs.extend(jalaliday)

function getToday() {
  return dayjs().calendar('jalali').format('YYYY/MM/DD')
}

function getTomorrow() {
  return dayjs().add(1, 'day').calendar('jalali').format('YYYY/MM/DD')
}

function getNextDay() {
  return dayjs().add(2, 'day').calendar('jalali').format('YYYY/MM/DD')
}

function getWeekdayDate(weekdayText, modifier) {
  const weekdays = [
    'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'
  ]
  const targetIndex = weekdays.indexOf(weekdayText)
  if (targetIndex === -1) return null

  let today = dayjs()
  const todayIndex = today.day()

  let diff = targetIndex + 1 - todayIndex
  if (diff <= 0) diff += 7

  if (modifier && /آینده|بعد/.test(modifier)) diff += 7

  return today.add(diff, 'day').calendar('jalali').format('YYYY/MM/DD')
}

function parseExplicitJalaliDate(text) {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ]
  const monthMap = Object.fromEntries(months.map((m, i) => [m, String(i + 1).padStart(2, '0')]))
  const regex = new RegExp(`(\d{1,2})\s*(${months.join('|')})`, 'g')
  const match = regex.exec(text)
  if (match) {
    const day = match[1].padStart(2, '0')
    const month = monthMap[match[2]]
    const year = dayjs().calendar('jalali').year()
    return {
      date: `${year}/${month}/${day}`,
      raw: match[0]
    }
  }
  return null
}

export function parsePersianTask(text) {
  const result = {
    title: text,
    date: null,
    time: null,
    timeRange: null,
    priority: null
  }

  let workingText = text

  const priorityKeywords = {
    'فوری': 'high',
    'مهم': 'medium',
    'عادی': 'low',
    'بعدا': 'low'
  }

  for (const key in priorityKeywords) {
    if (workingText.includes(key)) {
      result.priority = priorityKeywords[key]
      workingText = workingText.replace(key, '').trim()
    }
  }

  const explicitDate = parseExplicitJalaliDate(workingText)
  if (explicitDate) {
    result.date = explicitDate.date
    workingText = workingText.replace(explicitDate.raw, '').trim()
  }

  const dateKeywords = {
    'امروز': getToday(),
    'فردا': getTomorrow(),
    'پس‌فردا': getNextDay(),
    'پس فردا': getNextDay(),
  }

  for (const key in dateKeywords) {
    if (workingText.includes(key)) {
      result.date = dateKeywords[key]
      workingText = workingText.replace(key, '').trim()
    }
  }

  const weekdayExtendedRegex = /(شنبه|یکشنبه|دوشنبه|سه‌شنبه|چهارشنبه|پنجشنبه|جمعه)(\s+(آینده|بعد))?/
  const weekdayMatch = workingText.match(weekdayExtendedRegex)
  if (weekdayMatch) {
    const date = getWeekdayDate(weekdayMatch[1], weekdayMatch[3])
    if (date) {
      result.date = date
      workingText = workingText.replace(weekdayMatch[0], '').trim()
    }
  }

  const partOfDay = {
    'صبح': { from: '06:00', to: '12:00' },
    'ظهر': { from: '12:00', to: '14:00' },
    'عصر': { from: '16:00', to: '20:00' },
    'شب': { from: '20:00', to: '23:59' }
  }

  for (const key in partOfDay) {
    if (workingText.includes(key)) {
      result.timeRange = { ...partOfDay[key] }
      workingText = workingText.replace(key, '').trim()
    }
  }

  const rangeRegex = /ساعت\s*(\d{1,2})(?::(\d{2}))?\s*تا\s*(\d{1,2})(?::(\d{2}))?/i
  const rangeMatch = workingText.match(rangeRegex)
  if (rangeMatch) {
    const fromHour = rangeMatch[1].padStart(2, '0')
    const fromMin = rangeMatch[2] ? rangeMatch[2] : '00'
    const toHour = rangeMatch[3].padStart(2, '0')
    const toMin = rangeMatch[4] ? rangeMatch[4] : '00'

    result.timeRange = {
      from: `${fromHour}:${fromMin}`,
      to: `${toHour}:${toMin}`,
    }
    workingText = workingText.replace(rangeMatch[0], '').trim()
  }

  if (!result.timeRange) {
    const timeRegex = /(?:(?:ساعت)\s*)?(\d{1,2})(?:[:٫،](\d{2}))?\s*(صبح|ظهر|عصر|شب|AM|PM)?/i
    const timeMatch = workingText.match(timeRegex)

    if (timeMatch) {
      let hour = parseInt(timeMatch[1])
      const minute = timeMatch[2] ? timeMatch[2] : '00'
      const modifier = timeMatch[3]?.toLowerCase()

      if ((modifier === 'شب' || modifier === 'عصر') && hour < 12) hour += 12
      if (modifier === 'pm' && hour < 12) hour += 12
      if (modifier === 'صبح' && hour === 12) hour = 0
      if (!modifier && hour <= 6) hour += 12

      result.time = `${hour.toString().padStart(2, '0')}:${minute}`
      workingText = workingText.replace(timeMatch[0], '').trim()
    }
  }

  if (!result.date && (result.time || result.timeRange)) {
    result.date = getToday()
  }

  result.title = workingText.trim()
  return result
}
