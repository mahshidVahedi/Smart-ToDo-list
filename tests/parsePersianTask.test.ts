import { describe, it, expect } from 'vitest'
import { parsePersianTask } from '../src/utils/nlp'

describe('NLP - Persian Task Parsing', () => {

    it('should parse a simple task with time and period word', async () => {
        const result = await parsePersianTask('مطالعه شب ساعت ۸ تا ۹')
        expect(result).toHaveLength(1)
        expect(result[0].title).toBe('مطالعه')
        expect(result[0].timeRange).toBeDefined()
        expect(result[0].date).toBeDefined()
    })

    it('should split multiple tasks and clean both', async () => {
        const result = await parsePersianTask('مطالعه شب و خرید شنبه ساعت ۱۰')
        expect(result).toHaveLength(2)
        expect(result[0].title).toBe('مطالعه')
        expect(result[1].title).toBe('خرید')
        expect(result[1].date).toBeDefined()
    })

    it('should not split compound words with internal "و"', async () => {
        const result = await parsePersianTask('یادآوری سه‌شنبه هفته بعد ساعت ۹')
        expect(result).toHaveLength(1)
        expect(result[0].title).toBe('یادآوری')
        expect(result[0].date).toBeDefined()
    })

    it('should extract and format explicit Shamsi date', async () => {
        const result = await parsePersianTask('جلسه ۲۵ تیر ساعت ۱۰')
        expect(result).toHaveLength(1)
        expect(result[0].date).toMatch(/^1404\/04\/25$/)
        expect(result[0].title).toBe('جلسه')
    })

    it('should extract repeat info and clean title when repeated', async () => {
        const result = await parsePersianTask('جلسه مهم هر دوشنبه عصر ساعت ۴ تا ۶ در ۲۵ تیر')
        expect(result).toHaveLength(1)
        expect(result[0].repeat).toBe('weekly')
        expect(result[0].title).toBe('جلسه')
    })

    it('should remove priority words when result.priority is true', async () => {
        const result = await parsePersianTask('جلسه خیلی فوری شب ساعت ۹', { priority: true })
        expect(result).toHaveLength(1)
        expect(result[0].title).toBe('جلسه')
    })

    it('should clean orphaned numbers in title', async () => {
        const result = await parsePersianTask('مطالعه ساعت ۸ تا ۹')
        expect(result[0].title).toBe('مطالعه')
    })
    it('should handle empty input gracefully', async () => {
        const result = await parsePersianTask('')
        expect(result).toEqual([])
    })

    it('should fallback when no time/date is present', async () => {
        const result = await parsePersianTask('یادآوری خرید')
        expect(result[0].title).toBe('یادآوری خرید')
        expect(result[0].date).toBeDefined()
    })

    it('should handle noisy characters and extra spaces', async () => {
        const result = await parsePersianTask('  خرید   !!! در ۳ مرداد ')
        expect(result[0].title).toBe('خرید')
        expect(result[0].date).toMatch(/^1404\//)
    })

    it('should not crash with invalid weekday and time', async () => {
        const result = await parsePersianTask('دوشنبه ۹۹۹۹۹۹ ساعت ۲۵')
        expect(result[0].title).toContain('دوشنبه')
    })

    it('should split tasks using comma and و', async () => {
        const result = await parsePersianTask('مطالعه و تمرین، خرید، و جلسه مهم')
        expect(result).toHaveLength(4)
        expect(result[0].title).toBe('مطالعه')
        expect(result[1].title).toBe('تمرین')
        expect(result[2].title).toBe('خرید')
        expect(result[3].title).toBe('جلسه')
    })
})
