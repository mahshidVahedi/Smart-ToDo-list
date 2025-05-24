// src/utils/nlp/time.js
export function extractTime(text) {
    const match = text.match(/ساعت\s*(\d{1,2})[:٫،]?(\d{0,2})?\s*(صبح|ظهر|عصر|شب)?/)
    if (!match) return null
    let hour = parseInt(match[1])
    const minute = match[2] || '00'
    const mod = match[3]
  
    if ((mod === 'عصر' || mod === 'شب') && hour < 12) hour += 12
    if (!mod && hour <= 6) hour += 12
  
    return `${hour.toString().padStart(2, '0')}:${minute.padStart(2, '0')}`
  }
  
  export function extractTimeRange(text) {
    const match = text.match(/ساعت\s*(\d{1,2})[:٫،]?(\d{0,2})?\s*تا\s*(\d{1,2})[:٫،]?(\d{0,2})?/)
    if (!match) return null
    const from = `${match[1].padStart(2, '0')}:${(match[2] || '00').padStart(2, '0')}`
    const to = `${match[3].padStart(2, '0')}:${(match[4] || '00').padStart(2, '0')}`
    return { from, to }
  }
  