export function extractPriority(text) {
  if (/\b(فوری|خیلی مهم)\b/i.test(text)) return 'high'
  if (/\b(مهم|ضروری)\b/i.test(text)) return 'important'
  if (/\b(معمولی|متوسط)\b/i.test(text)) return 'medium'
  if (/\b(عادی|بعدا|تأخیر)\b/i.test(text)) return 'low'
  return null
}