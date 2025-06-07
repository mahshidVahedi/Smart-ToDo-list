const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
const arabicDigits = '٠١٢٣٤٥٦٧٨٩';

function fixPersianDigits(str) {
  return str.replace(/[۰-۹٠-٩]/g, d => {
    const idx = persianDigits.indexOf(d) !== -1 ? persianDigits.indexOf(d) : arabicDigits.indexOf(d);
    return idx > -1 ? String(idx) : d;
  });
}

// const timeRegex = /(?:ساعت\s*)?([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\d۰-۹٠-٩]{1,2}))?\s*(صبح|عصر|ظهر|شب|امشب)?/gi;

export function normalizeHour(hour, meridiem) {
  hour = parseInt(hour, 10);
  if (isNaN(hour) || hour < 0 || hour >= 24) return 0;

  const m = (meridiem || '').replace(/\s/g, '').trim();

  if (['شب', 'امشب', 'عصر'].includes(m) && hour >= 1 && hour <= 11) return hour + 12;
  if (m === 'ظهر') return 12;
  if (m === 'صبح' && hour === 12) return 0;

  return hour;
}

export function extractTime(text) {
  const fixedText = fixPersianDigits(text);
  const matches = [];

  const patterns = [
    {
      regex: /(?:ساعت\s*)?([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\d۰-۹٠-٩]{1,2}))?\s*(صبح|عصر|ظهر|شب|امشب)?/gi,
      getParts: (m) => ({ h: m[1], m: m[2], meridiem: m[3] }),
    },
    {
      regex: /(صبح|عصر|ظهر|شب|امشب)\s*(?:ساعت\s*)?([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\د۰-۹٠-٩]{1,2}))?/gi,
      getParts: (m) => ({ meridiem: m[1], h: m[2], m: m[3] }),
    },
  ];

  for (const { regex, getParts } of patterns) {
    let match;
    while ((match = regex.exec(fixedText))) {
      const { h, m, meridiem } = getParts(match);
      const hour = normalizeHour(h, meridiem);
      const minute = m ? parseInt(m, 10) : 0;
      matches.push({
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        index: match.index
      });
    }
  }

  if (!matches.length) return null;
  return matches[matches.length - 1].time;
}

export function extractTimeRange(text) {
  const fixedText = fixPersianDigits(text);

  const patterns = [
    {
      regex: /(?:(صبح|ظهر|عصر|شب|امشب)\s*)?(?:از\s*)?ساعت\s*([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\d۰-۹٠-٩]{1,2}))?\s*تا\s*([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\د۰-۹٠-٩]{1,2}))?/i,
      getParts: m => ({
        meridiem: m[1], h1: m[2], m1: m[3], h2: m[4], m2: m[5]
      })
    },
    {
      regex: /(صبح|ظهر|عصر|شب|امشب)\s*ساعت\s*([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\د۰-۹٠-٩]{1,2}))?\s*تا\s*([\د۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\د۰-۹٠-٩]{1,2}))?/i,
      getParts: m => ({
        meridiem: m[1], h1: m[2], m1: m[3], h2: m[4], m2: m[5]
      })
    }
  ];

  for (const { regex, getParts } of patterns) {
    const match = regex.exec(fixedText);
    if (!match) continue;

    let { h1, m1, h2, m2, meridiem } = getParts(match);

    if (!meridiem) {
      const after = fixedText.slice(match.index + match[0].length, match.index + match[0].length + 10);
      const context = /(صبح|ظهر|عصر|شب|امشب)/i.exec(after);
      if (context) meridiem = context[1];
    }

    const fromHour = normalizeHour(h1, meridiem);
    const toHour = normalizeHour(h2, meridiem);
    const fromMinute = m1 ? parseInt(m1, 10) : 0;
    const toMinute = m2 ? parseInt(m2, 10) : 0;

    return {
      from: `${String(fromHour).padStart(2, '0')}:${String(fromMinute).padStart(2, '0')}`,
      to: `${String(toHour).padStart(2, '0')}:${String(toMinute).padStart(2, '0')}`
    };
  }

  return null;
}



export function extractTimeRanges(text) {
  const fixedText = fixPersianDigits(text);
  const results = [];

  const patterns = [
    {
      regex: /(?:از)?\s*ساعت\s*([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\d۰-۹٠-٩]{1,2}))?\s*تا\s*([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\d۰-۹٠-٩]{1,2}))?\s*(صبح|عصر|ظهر|شب|امشب)?/gi,
      getParts: (m) => ({ h1: m[1], m1: m[2], h2: m[3], m2: m[4], meridiem: m[5] }),
    },
    {
      regex: /(صبح|عصر|ظهر|شب|امشب)\s*ساعت\s*([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\d۰-۹٠-٩]{1,2}))?\s*تا\s*([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\د۰-۹٠-٩]{1,2}))?/gi,
      getParts: (m) => ({ meridiem: m[1], h1: m[2], m1: m[3], h2: m[4], m2: m[5] }),
    },
    {
      regex: /([\d۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\د۰-۹٠-٩]{1,2}))?\s*تا\s*([\د۰-۹٠-٩]{1,2})(?:[:٫،\.]?([\د۰-۹٠-٩]{1,2}))?\s*(صبح|عصر|ظهر|شب|امشب)?/gi,
      getParts: (m) => ({ h1: m[1], m1: m[2], h2: m[3], m2: m[4], meridiem: m[5] }),
    }
  ];

  const allMatches = [];

  for (const { regex, getParts } of patterns) {
    let match;
    while ((match = regex.exec(fixedText))) {
      const index = match.index;
      const { h1, m1, h2, m2, meridiem } = getParts(match);
      allMatches.push({ h1, m1, h2, m2, meridiem, index });
    }
  }

  allMatches.sort((a, b) => a.index - b.index);

  for (const { h1, m1, h2, m2, meridiem } of allMatches) {
    const fromHour = normalizeHour(h1, meridiem);
    const toHour = normalizeHour(h2, meridiem);
    const fromMinute = m1 ? parseInt(m1, 10) : 0;
    const toMinute = m2 ? parseInt(m2, 10) : 0;

    results.push({
      from: `${String(fromHour).padStart(2, '0')}:${String(fromMinute).padStart(2, '0')}`,
      to: `${String(toHour).padStart(2, '0')}:${String(toMinute).padStart(2, '0')}`
    });
  }

  return results;
}

