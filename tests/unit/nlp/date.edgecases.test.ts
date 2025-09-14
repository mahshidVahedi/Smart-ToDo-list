import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { extractDate } from '../../../src/utils/nlp/date'; 

describe('extractDate - تشخیص تاریخ‌های فارسی از متن', () => {


  afterAll(() => {
    vi.useRealTimers();
  });

  it('باید امروز را تشخیص دهد', () => {
    const result = extractDate('کار امروز');
    expect(result.date).toBe('1404/06/13');
  });

  it('باید فردا را تشخیص دهد', () => {
    const result = extractDate('یادداشت فردا');
    expect(result.date).toBe('1404/06/14');
  });

  it('باید پس‌فردا را تشخیص دهد', () => {
    const result = extractDate('برنامه پس‌فردا');
    expect(result.date).toBe('1404/06/15');
  });

  it('باید روز هفته مثل جمعه را تشخیص دهد', () => {
    const result = extractDate('خرید جمعه');
    expect(result.date).toBe('1404/06/14'); 
  });

  it('باید "شنبه هفته بعد" را تشخیص دهد', () => {
    const result = extractDate('جلسه شنبه هفته بعد');
    expect(result.date).toBe('1404/06/15'); 
  });

  it('باید "۳ روز دیگر" را تبدیل کند', () => {
    const result = extractDate('پروژه 3 روز دیگر');
    expect(result.date).toBe('1404/06/16');
  });

  it('باید "۲ هفته دیگر" را تبدیل کند', () => {
    const result = extractDate('جلسه 2 هفته دیگر');
    expect(result.date).toBe('1404/06/27');
  });

  it('باید تاریخ شمسی صریح مثل ۲۶ تیر را تشخیص دهد', () => {
    const result = extractDate('ارسال گزارش 26 آبان');
    expect(result.date).toBe('1404/08/26');
  });

});