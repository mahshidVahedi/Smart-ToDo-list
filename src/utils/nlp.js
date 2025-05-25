import { normalizeText } from './nlp/normalize'
import { extractDate } from './nlp/date'
import { extractTime, extractTimeRange } from './nlp/time'
import { extractRepeat } from './nlp/repeat'
import { extractPriority } from './nlp/priority'
import { extractTitle } from './nlp/title'

export async function parsePersianTask(text, options = {}) {
  if (!text || !text.trim()) return []

  const normalized = normalizeText(text)

  const detectedPriority = extractPriority(normalized)
  const dateInfo = extractDate(normalized)
  const timeRange = extractTimeRange(normalized)
  const time = timeRange ? null : extractTime(normalized)
  const repeat = dateInfo.repeat || extractRepeat(normalized)

  const common = {
    date: dateInfo.date,
    time,
    timeRange,
    priority: 'priority' in options ? options.priority : detectedPriority,
    repeat
  }

  const parts = normalized
    .split(/[,،]|(?:\s+و\s+)/g)
    .map(p => p.trim())
    .filter(p => p.length > 1)

  return parts.map(part => ({
    title: extractTitle(part, common),
    ...common
  }))
}