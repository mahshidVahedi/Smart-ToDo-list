import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { extractDate } from '../src/utils/nlp/date'; 

describe('extractDate - تشخیص تاریخ‌های فارسی از متن', () => {
  beforeAll(() => {
    vi.setSystemTime(new Date('2025-07-11')); // 20 تیر 1404
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('باید امروز را تشخیص دهد', () => {
    const result = extractDate('کار امروز');
    expect(result.date).toBe('1404/04/20');
  });

  it('باید فردا را تشخیص دهد', () => {
    const result = extractDate('یادداشت فردا');
    expect(result.date).toBe('1404/04/21');
  });

  it('باید پس‌فردا را تشخیص دهد', () => {
    const result = extractDate('برنامه پس‌فردا');
    expect(result.date).toBe('1404/04/22');
  });

  it('باید روز هفته مثل جمعه را تشخیص دهد', () => {
    const result = extractDate('خرید جمعه');
    expect(result.date).toBe('1404/04/27'); 
  });

  it('باید "شنبه هفته بعد" را تشخیص دهد', () => {
    const result = extractDate('جلسه شنبه هفته بعد');
    expect(result.date).toBe('1404/04/21'); // شنبه آینده
  });

  it('باید "۳ روز دیگر" را تبدیل کند', () => {
    const result = extractDate('پروژه 3 روز دیگر');
    expect(result.date).toBe('1404/04/23');
  });

  it('باید "۲ هفته دیگر" را تبدیل کند', () => {
    const result = extractDate('جلسه 2 هفته دیگر');
    expect(result.date).toBe('1404/05/03');
  });

  it('باید تاریخ شمسی صریح مثل ۲۶ تیر را تشخیص دهد', () => {
    const result = extractDate('ارسال گزارش 26 تیر');
    expect(result.date).toBe('1404/04/26');
  });

  it('باید اگر تاریخ گذشته داده شده، سال بعد را بدهد', () => {
    vi.setSystemTime(new Date('2025-08-01')); // 10 مرداد 1404
    const result = extractDate('ملاقات 9 مرداد');
    expect(result.date).toBe('1405/05/09'); 
  });
});
