import moment from 'moment-jalaali';
import { getToday, addDays, toShamsi, fromShamsi, isBeforeToday } from './utils';

// نگاشت روزهای هفته به شماره (moment: 0=Sunday, 6=Saturday)
const weekdayMap = {
  'شنبه': 6, 'شنبه‌ها': 6,
  'یکشنبه': 0, 'یکشنبه‌ها': 0,
  'دوشنبه': 1, 'دوشنبه‌ها': 1,
  'سه‌شنبه': 2, 'سه‌شنبه‌ها': 2,
  'چهارشنبه': 3, 'چهارشنبه‌ها': 3,
  'پنج‌شنبه': 4, 'پنج‌شنبه‌ها': 4,
  'پنجشنبه': 4, 'پنجشنبه‌ها': 4,
  'جمعه': 5, 'جمعه‌ها': 5,
};

export function extractDate(text) {
  const normalized = text.replace(/\s+/g, ' ').trim();

  if (/امروز/.test(normalized)) {
    return { date: toShamsi(getToday()), repeat: '', isExplicit: false };
  }

  if (/امشب/.test(normalized)) {
    return { date: toShamsi(getToday()), repeat: '', isExplicit: false };
  }

  if (/پس‌?فردا/.test(normalized)) {
    return { date: toShamsi(addDays(getToday(), 2)), repeat: '', isExplicit: false };
  }

  if (/فردا/.test(normalized)) {
    return { date: toShamsi(addDays(getToday(), 1)), repeat: '', isExplicit: false };
  }

  // مثل: "شنبه هفته بعد"
  const matchWeekdayNext = normalized.match(
    /(شنبه|یکشنبه|دوشنبه|سه‌شنبه|چهارشنبه|پنج‌شنبه|پنجشنبه|جمعه)(‌?ها)?\s*(ی)?\s*(هفته\s*(آینده|بعد))/
  );
  if (matchWeekdayNext) {
    const key = matchWeekdayNext[1] + (matchWeekdayNext[2] || '');
    const weekday = weekdayMap[key];
    const date = toShamsi(getNextWeekday(weekday)); 
    return { date, repeat: '', isExplicit: true };
  }

  const matchWeekdaySimple = normalized.match(/(شنبه|یکشنبه|دوشنبه|سه‌شنبه|چهارشنبه|پنج‌شنبه|پنجشنبه|جمعه)(‌?ها)?/);
  if (matchWeekdaySimple) {
    const key = matchWeekdaySimple[1] + (matchWeekdaySimple[2] || '');
    const weekday = weekdayMap[key];
    const date = toShamsi(getNextWeekday(weekday));
    const isRecurring = key.endsWith('ها');
    return { date, repeat: isRecurring ? 'weekly' : '', isExplicit: true };
  }

  const matchRelative = normalized.match(/(\d{1,2})\s*(روز|هفته)\s*(دیگر|بعد)/);
  if (matchRelative) {
    const amount = parseInt(matchRelative[1]);
    const unit = matchRelative[2] === 'هفته' ? 7 : 1;
    return { date: toShamsi(addDays(getToday(), amount * unit)), repeat: '', isExplicit: false };
  }

  const matchShamsi = normalized.match(/(\d{1,2})\s*(فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند)/);
  if (matchShamsi) {
    const day = matchShamsi[1].padStart(2, '0');
    const monthMap = {
      فروردین: '01', اردیبهشت: '02', خرداد: '03', تیر: '04',
      مرداد: '05', شهریور: '06', مهر: '07', آبان: '08',
      آذر: '09', دی: '10', بهمن: '11', اسفند: '12'
    };
    const month = monthMap[matchShamsi[2]];
    const today = getToday();
    const currentYear = toShamsi(today).split('/')[0];
    let candidate = `${currentYear}/${month}/${day}`;
    if (isBeforeToday(candidate)) {
      candidate = `${parseInt(currentYear) + 1}/${month}/${day}`;
    }
    return { date: candidate, repeat: '', isExplicit: true };
  }

  return { date: null, repeat: null, isExplicit: false };
}

export function getNextDate(shamsiDateOrNull, repeat) {
  const base = shamsiDateOrNull && !isBeforeToday(shamsiDateOrNull)
    ? fromShamsi(shamsiDateOrNull)
    : moment();

  if (repeat === 'daily') return base.add(1, 'day').format('jYYYY/jMM/jDD');
  if (repeat === 'weekly') return base.add(7, 'day').format('jYYYY/jMM/jDD');

  return null;
}

export function getNextWeekday(targetWeekday, offsetWeeks = 0) {
  const today = getToday();
  const todayDay = today.day(); // 0 = یکشنبه, 6 = شنبه
  let daysToAdd = (targetWeekday - todayDay + 7) % 7;

  if (daysToAdd === 0) daysToAdd = 7;

  daysToAdd += offsetWeeks * 7;

  return addDays(today, daysToAdd);
}

