import { normalizeText } from './nlp/normalize'
import { extractDate } from './nlp/date'
import { extractTime, extractTimeRange, extractTimeRanges } from './nlp/time'
import { extractRepeat } from './nlp/repeat'
import { extractPriority } from './nlp/priority'
import { extractTitle } from './nlp/title'

export async function parsePersianTask(text, options = {}) {
  if (!text || !text.trim()) return []

  const normalized = normalizeText(text)
  const detectedPriority = extractPriority(normalized)
  const dateInfo = extractDate(normalized)
  const allTimeRanges = extractTimeRanges(normalized)
  const repeat = dateInfo.repeat || extractRepeat(normalized)

  const parts = normalized
    .split(/[,،]|(?:\s+و\s+)/g)
    .map(p => p.trim())
    .filter(p => p.length > 1)

    if (allTimeRanges.length > 1) {
      const timeRegex = /(?:از)?\s*ساعت\s*[\d۰-۹٠-٩]{1,2}(?:[:٫،\.]?[\d۰-۹٠-٩]{1,2})?\s*تا\s*[\d۰-۹٠-٩]{1,2}(?:[:٫،\.]?[\d۰-۹٠-٩]{1,2})?\s*(?:صبح|عصر|ظهر|شب)?/gi;
      const chunks = normalized.split(timeRegex).map(s => s.trim()).filter(Boolean);
    
      return allTimeRanges.map((range, i) => ({
        title: extractTitle(chunks[i] || normalized, {
          date: dateInfo.date,
          timeRange: range,
          priority: detectedPriority,
          repeat
        }),
        date: dateInfo.date,
        time: null,
        timeRange: range,
        priority: 'priority' in options ? options.priority : detectedPriority,
        repeat
      }));
    }
    
    
  

  return parts.map((part) => {
    const partTimeRange = extractTimeRange(part) || null
    const partTime = partTimeRange ? null : extractTime(part) || null

    return {
      title: extractTitle(part, {
        date: dateInfo.date,
        timeRange: partTimeRange,
        time: partTime,
        priority: detectedPriority,
        repeat
      }),
      date: dateInfo.date,
      time: partTime,
      timeRange: partTimeRange,
      priority: 'priority' in options ? options.priority : detectedPriority,
      repeat
    }
  })
}
