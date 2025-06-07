import { normalizeText } from './normalize';

export function extractPriority(text) {
  text = normalizeText(text);

  if (/فوری|خیلی[\s\u200c]?مهم/.test(text)) return 'high';
  if (/مهم|ضروری/.test(text)) return 'important';
  if (/معمولی|متوسط/.test(text)) return 'medium';
  if (/عادی|بعدا|تاخیر|تأخیر/.test(text)) return 'low';

  return null;
}
