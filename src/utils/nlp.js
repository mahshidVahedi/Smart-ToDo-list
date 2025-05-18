// src/utils/nlp.js
import { normalizeText } from './nlp/normalize'
import { extractDate } from './nlp/date'
import { extractTime, extractTimeRange } from './nlp/time'
import { extractRepeat } from './nlp/repeat'
import { extractPriority } from './nlp/priority'
import { extractTitle } from './nlp/title'

export async function parsePersianTask(text) {
  const normalized = normalizeText(text)
  const result = {
    title: null,
    date: null,
    time: null,
    timeRange: null,
    priority: null,
    repeat: null
  }

  result.priority = extractPriority(normalized)
  result.repeat = extractRepeat(normalized)
  result.date = extractDate(normalized)
  result.timeRange = extractTimeRange(normalized)
  result.time = result.timeRange ? null : extractTime(normalized)
  result.title = extractTitle(normalized, result)

  if (!result.date && (result.time || result.timeRange)) {
    const { getToday } = await import('./nlp/utils')
    result.date = getToday()
  }

  return result
}