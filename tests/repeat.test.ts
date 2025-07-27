import { describe, it, expect } from 'vitest';
import { extractDate } from '../src/utils/nlp/date';
import { extractTitle } from '../src/utils/nlp/title';
import { extractRepeat } from '../src/utils/nlp/repeat';

describe('Smart NLP Parser – ترکیب جمله تکرارشونده', () => {
  const text = 'کلاس درس یکشنبه‌ها ساعت ۱۰ صبح';

  it('should extract correct date and repeat for recurring weekday', () => {
    const { date, repeat, isExplicit } = extractDate(text);
    expect(date).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
    expect(repeat).toBe('weekly');
    expect(isExplicit).toBe(true);
  });

  it('should extract clean title', () => {
    const result = {};
    const title = extractTitle(text, result);
    expect(title).toBe('کلاس درس');
  });

  it('should extract weekly repeat', () => {
    const repeat = extractRepeat(text);
    expect(repeat).toBe('weekly');
  });
});

describe('extractRepeat – تشخیص تکرار', () => {
  it('should return null for explicit one-time weekdays like "دوشنبه هفته بعد"', () => {
    expect(extractRepeat('ورزش دوشنبه هفته بعد')).toBe(null);
    expect(extractRepeat('کلاس سه‌شنبه هفته آینده')).toBe(null);
    expect(extractRepeat('جلسه جمعه هفته بعد')).toBe(null);
  });

  it('should detect weekly repeat from "هر [روز هفته]"', () => {
    expect(extractRepeat('ورزش هر دوشنبه')).toBe('weekly');
    expect(extractRepeat('کلاس هر سه‌شنبه ساعت ۱۰')).toBe('weekly');
  });

  it('should detect daily repeat from "هر روز"', () => {
    expect(extractRepeat('پیاده‌روی هر روز')).toBe('daily');
  });

  it('should detect weekly from phrases like "هفته‌ای یک‌بار"', () => {
    expect(extractRepeat('تمرین هفته‌ای یک‌بار')).toBe('weekly');
    expect(extractRepeat('کلاس هر هفته')).toBe('weekly');
  });

  it('should return null if no repeat found', () => {
    expect(extractRepeat('مطالعه کتاب')).toBe(null);
  });

  it('should detect "شنبه‌ها" as weekly repeat', () => {
    expect(extractRepeat('کلاس شنبه‌ها')).toBe('weekly');
    expect(extractRepeat('تمرین جمعه‌ها')).toBe('weekly');
  });
});
