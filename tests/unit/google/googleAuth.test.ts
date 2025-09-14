import { describe, it, expect, vi, beforeEach } from 'vitest'
vi.mock('gapi-script', () => {
  const instance = {
    signIn: vi.fn().mockResolvedValue({
      getAuthResponse: () => ({ access_token: 'fake-token' }),
    }),
    signOut: vi.fn(),
    isSignedIn: { get: vi.fn(() => true) },
  }
  return {
    gapi: {
      load: vi.fn((_: string, cb: () => void) => cb()),
      client: { init: vi.fn().mockResolvedValue(undefined) },
      auth2: { getAuthInstance: vi.fn(() => instance) }, 
    },
  }
})


import {
  initGoogleApi,
  signInWithGoogle,
  getAccessToken,
  isSignedIn,
  signOut,
} from '../../../src/utils/googleAuth' 

import { gapi } from 'gapi-script'

describe('googleAuth (mocked gapi-script)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initGoogleApi، gapi.client.init را صدا می‌زند و resolve می‌شود', async () => {
    await expect(initGoogleApi()).resolves.not.toThrow()
    expect(gapi.load).toHaveBeenCalledWith('client:auth2', expect.any(Function))
    expect(gapi.client.init).toHaveBeenCalled()
  })

  it('signInWithGoogle توکن را ست می‌کند و user را برمی‌گرداند', async () => {
    const user = await signInWithGoogle()
    expect(user).toBeTruthy()
    expect(getAccessToken()).toBe('fake-token')
  })

  it('isSignedIn وقتی get() true است، true برمی‌گرداند', () => {
    expect(isSignedIn()).toBe(true)
  })

  it('signOut متد signOut را صدا می‌زند', () => {
    signOut()
    expect(gapi.auth2.getAuthInstance).toHaveBeenCalled()
    expect(gapi.auth2.getAuthInstance().signOut).toHaveBeenCalled()
  })
})
