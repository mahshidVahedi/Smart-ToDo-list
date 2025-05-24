import moment from 'moment-jalaali'

export function getToday() {
  return moment()
}

export function addDays(date, days) {
  return moment(date).add(days, 'days')
}

export function getNextWeekday(weekdayIndex) {
  const today = moment()
  const todayIso = today.isoWeekday() // 1 (Mon) → 7 (Sun)

  // چون شنبه=7، سه‌شنبه=3
  let daysUntil = weekdayIndex - todayIso
  if (daysUntil <= 0) daysUntil += 7
  return today.add(daysUntil, 'days')
}

export function toShamsi(date) {
  return moment(date).format('jYYYY/jMM/jDD')
}
