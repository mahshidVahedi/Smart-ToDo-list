import { describe, it, expect } from 'vitest'
import { extractPriority } from '../../../src/utils/nlp/priority'

describe('extractPriority', () => {
  it('high', () => {
    expect(extractPriority('قرار فوری')).toBe('high')
    expect(extractPriority('جلسه خیلی‌مهم')).toBe('high')
  })
  it('important', () => {
    expect(extractPriority('جلسه مهم')).toBe('important')
  })
  it('medium', () => {
    expect(extractPriority('کار متوسط')).toBe('medium')
    expect(extractPriority('پیگیری معمولی')).toBe('medium')
  })
  it('low', () => {
    expect(extractPriority('پاسخ‌دهی عادی')).toBe('low')
    expect(extractPriority('کار با تأخیر')).toBe('low')
    expect(extractPriority('کار با تاخیر')).toBe('low')
  })
  it('null', () => {
    expect(extractPriority('مطالعه کتاب')).toBe(null)
    expect(extractPriority('پروژه ریاضی')).toBe(null)
  })
})