const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

function fixPersianDigits(str) {
  return str.replace(/[۰-۹٠-٩]/g, d => {
    const idx = persianDigits.indexOf(d) !== -1 ? persianDigits.indexOf(d) : arabicDigits.indexOf(d);
    return idx > -1 ? String(idx) : d;
  });
}

const timeRegex = /(?:ساعت)?\s*([\d]{1,2})(?:[:٫،\.]?(\d{1,2}))?\s*(صبح|عصر|ظهر|شب)?/gi;

function normalizeHour(hour, meridiem) {
  hour = parseInt(hour, 10);
  if (hour >= 24) return 0;
  if (!meridiem) return hour;
  if (meridiem === 'شب' && hour >= 1 && hour <= 11) return hour + 12;
  if (meridiem === 'عصر' && hour < 12) return hour + 12;
  if (meridiem === 'ظهر') return 12;
  if (meridiem === 'صبح' && hour === 12) return 0;
  return hour;
}

export function extractTime(text) {
  const fixedText = fixPersianDigits(text);
  let match;
  let lastValid = null;
  while ((match = timeRegex.exec(fixedText))) {
    const [, h, m, meridiem] = match;
    const hour = normalizeHour(h, meridiem);
    const minute = m ? parseInt(m, 10) : 0;
    lastValid = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }
  return lastValid;
}

export function extractTimeRange(text) {
  const rangeRegex = /(?:از)?\s*ساعت\s*([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\d۰-۹٠-٩]{1,2}))?\s*تا\s*([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\d۰-۹٠-٩]{1,2}))?\s*(صبح|عصر|ظهر|شب)?/i;
  const match = rangeRegex.exec(fixPersianDigits(text));
  if (!match) return null;

  let [, h1, m1, h2, m2, meridiem] = match;
  let fromHour = normalizeHour(h1, meridiem);
  let toHour = normalizeHour(h2, meridiem);
  const fromMinute = m1 ? parseInt(m1, 10) : 0;
  const toMinute = m2 ? parseInt(m2, 10) : 0;

  return {
    from: `${String(fromHour).padStart(2, '0')}:${String(fromMinute).padStart(2, '0')}`,
    to: `${String(toHour).padStart(2, '0')}:${String(toMinute).padStart(2, '0')}`
  };
}

export function extractTimeRanges(text) {
  const rangeRegex = /(?:از)?\s*ساعت\s*([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\d۰-۹٠-٩]{1,2}))?\s*تا\s*([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\d۰-۹٠-٩]{1,2}))?\s*(صبح|عصر|ظهر|شب)?/gi;
  const fixedText = fixPersianDigits(text);
  const results = [];
  let match;
  while ((match = rangeRegex.exec(fixedText))) {
    let [, h1, m1, h2, m2, meridiem] = match;
    let fromHour = normalizeHour(h1, meridiem);
    let toHour = normalizeHour(h2, meridiem);
    const fromMinute = m1 ? parseInt(m1, 10) : 0;
    const toMinute = m2 ? parseInt(m2, 10) : 0;
    results.push({
      from: `${String(fromHour).padStart(2, '0')}:${String(fromMinute).padStart(2, '0')}`,
      to: `${String(toHour).padStart(2, '0')}:${String(toMinute).padStart(2, '0')}`
    });
  }
  return results;
}
