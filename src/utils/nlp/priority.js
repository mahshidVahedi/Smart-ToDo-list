export function extractPriority(text) {
    if (/فوری|خیلی مهم/i.test(text)) return 'high'
    if (/مهم|ضروری/i.test(text)) return 'important'
    if (/معمولی|متوسط/i.test(text)) return 'medium'
    if (/عادی|بعدا|تأخیر/i.test(text)) return 'low'
    return null
  }
  