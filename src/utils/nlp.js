import { normalizeText } from './nlp/normalize';
import { extractDate } from './nlp/date';
import { extractTime, extractTimeRange, extractTimeRanges } from './nlp/time';
import { extractRepeat } from './nlp/repeat';
import { extractPriority } from './nlp/priority';
import { extractTitle } from './nlp/title';

function tagNumbers(text) {
  const tags = [];

  const dateMatch = text.match(/(\d{1,2})\s+(فروردین|اردیبهشت|خرداد|تیر|مرداد|شهریور|مهر|آبان|آذر|دی|بهمن|اسفند)/);
  if (dateMatch) {
    tags.push({ type: 'date', value: dateMatch[1], raw: dateMatch[0] });
  }

  const repeatMatch = text.match(/هر\s+(\d{1,2})\s+(روز|هفته|ماه)/);
  if (repeatMatch) {
    tags.push({ type: 'repeat', value: repeatMatch[1], raw: repeatMatch[0] });
  }

  const timeMatches = [...text.matchAll(/(?:ساعت\s*)?(\d{1,2})(?::(\d{2}))?/g)];
  timeMatches.forEach(match => {
    tags.push({ type: 'time', value: match[1], raw: match[0] });
  });

  return tags;
}

export async function parsePersianTask(text, options = {}) {
  if (!text || !text.trim()) return [];

  const normalized = normalizeText(text);
  const tags = tagNumbers(normalized);

  const dateTag = tags.find(t => t.type === 'date');
  const textWithoutDate = dateTag ? normalized.replace(dateTag.raw, '') : normalized;

  const detectedPriority = extractPriority(textWithoutDate);
  const dateInfo = extractDate(normalized);
  const repeat = dateInfo.repeat || extractRepeat(textWithoutDate);

  const allTimeRanges = extractTimeRanges(textWithoutDate);

  const parts = textWithoutDate
    .split(/[,،]|(?:\s+و\s+)|\n+/g)
    .map(p => p.trim())
    .filter(p => p.length > 1);

  if (allTimeRanges.length > 1) {
    return parts.map((part) => {
      const range = extractTimeRange(part);
      return {
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
      };
    });
  }

  return parts.map((part) => {
    const partTimeRange = extractTimeRange(part);
    const partTime = partTimeRange ? null : extractTime(part, { context: normalized }) || null;

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
