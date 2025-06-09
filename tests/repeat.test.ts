import { extractRepeat } from '../src/utils/nlp/repeat'
import { describe, it, expect } from 'vitest'
describe('extractRepeat', () => {
    it('should return null for explicit one-time weekdays like "دوشنبه هفته بعد"', () => {
      expect(extractRepeat('ورزش دوشنبه هفته بعد')).toBe(null)
      expect(extractRepeat('کلاس سه‌شنبه هفته آینده')).toBe(null)
      expect(extractRepeat('جلسه جمعه هفته بعد')).toBe(null)
    })
  
    it('should detect weekly repeat from "هر [روز هفته]"', () => {
      expect(extractRepeat('ورزش هر دوشنبه')).toBe('weekly')
      expect(extractRepeat('کلاس هر سه‌شنبه ساعت ۱۰')).toBe('weekly')
    })
  
    it('should detect daily repeat from "هر روز"', () => {
      expect(extractRepeat('پیاده‌روی هر روز')).toBe('daily')
    })
  
    it('should detect weekly from phrases like "هفته‌ای یک‌بار"', () => {
      expect(extractRepeat('تمرین هفته‌ای یک‌بار')).toBe('weekly')
      expect(extractRepeat('کلاس هر هفته')).toBe('weekly')
    })
  
    it('should return null if no repeat found', () => {
      expect(extractRepeat('مطالعه کتاب')).toBe(null)
    })
  })