import { afterEach, beforeAll, afterAll, vi, expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers' 

expect.extend(matchers)

const FIXED_ISO = '2025-09-04T09:00:00.000Z'

beforeAll(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(FIXED_ISO))
})

afterEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.useRealTimers()
})
