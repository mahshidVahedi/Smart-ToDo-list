import { describe, it, expect } from 'vitest'

describe('GoogleSync module can be imported', () => {
  it('imports without throwing', async () => {
    const mod = await import('../../src/sync/GoogleSync.js')
    expect(mod).toBeTruthy()
  })
})