// src/utils/nlp/repeat.js
export function extractRepeat(text) {
    if (/هر ?روز/.test(text)) return 'daily'
    if (/هفته.?ای( یک ?بار)?|هر ?هفته/.test(text)) return 'weekly'
    if (/هر (شنبه|یکشنبه|دوشنبه|سه‌شنبه|چهارشنبه|پنجشنبه|جمعه)/.test(text)) return 'weekly'
    return null
  }
  