import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('initGoogleApi (global gapi)', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    // mock global gapi BEFORE importing module
    ;(globalThis as any).gapi = {
      load: vi.fn((_: string, cb: () => void) => cb()),
      client: { init: vi.fn().mockResolvedValue('ok') },
    }
    const mod = await import('../../../src/utils/googleApiUtils') 
    ;(globalThis as any).__initGoogleApi = mod.initGoogleApi
  })

  it('resolve می‌شود و client.init صدا می‌خورد', async () => {
    await expect((globalThis as any).__initGoogleApi()).resolves.toBe('ok')
    expect((globalThis as any).gapi.load).toHaveBeenCalledWith('client:auth2', expect.any(Function))
    expect((globalThis as any).gapi.client.init).toHaveBeenCalled()
  })

  it('reject وقتی init خطا می‌دهد', async () => {
    ;(globalThis as any).gapi.client.init.mockRejectedValueOnce(new Error('init failed'))
    await expect((globalThis as any).__initGoogleApi()).rejects.toThrow('init failed')
  })
})