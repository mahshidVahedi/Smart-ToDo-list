import { normalizeText } from './nlp/normalize'
import { extractDate } from './nlp/date'
import { extractTime, extractTimeRange, extractTimeRanges } from './nlp/time'
import { extractRepeat } from './nlp/repeat'
import { extractPriority } from './nlp/priority'
import { extractTitle } from './nlp/title'
export async function parsePersianTask(text, options = {}) {
  if (!text || !text.trim()) return [];

  const normalized = normalizeText(text);
  const detectedPriority = extractPriority(normalized);
  const dateInfo = extractDate(normalized);
  const repeat = dateInfo.repeat || extractRepeat(normalized);

  const allTimeRanges = extractTimeRanges(normalized);

  if (allTimeRanges.length > 1) {
    const parts = normalized
      .split(/[,،]|(?:\s+و\s+)/g)
      .map(p => p.trim())
      .filter(p => p.length > 1);

    const result = [];

    parts.forEach((part, i) => {
      const range = extractTimeRange(part);

      result.push({
        title: extractTitle(part, {
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
      });
    });

    return result;
  }

  const parts = normalized
    .split(/[,،]|(?:\s+و\s+)|\n+/g)
    .map(p => p.trim())
    .filter(p => p.length > 1);

  return parts.map((part) => {
    const partTimeRange = extractTimeRange(part) || null;
    const partTime = partTimeRange ? null : extractTime(part) || null;

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
    };
  });
}
