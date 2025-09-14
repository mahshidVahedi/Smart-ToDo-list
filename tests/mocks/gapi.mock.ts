import { vi } from 'vitest'

export function installGapiMock() {
  globalThis.gapi = {
    auth2: {
      getAuthInstance: () => ({
        signIn: vi.fn().mockResolvedValue({}),
        isSignedIn: { get: vi.fn(() => true) },
        currentUser: { get: vi.fn(() => ({ getAuthResponse: () => ({ access_token: 'tkn' }) })) }
      })
    },
    client: {
      load: vi.fn().mockResolvedValue(undefined),
      calendar: { events: { list: vi.fn(), insert: vi.fn(), delete: vi.fn() } },
      tasks: { tasks: { list: vi.fn(), insert: vi.fn() } }
    }
  } as any
}

export function installFetchMock() {
  globalThis.fetch = vi.fn(async () => ({
    ok: true,
    json: async () => ({ ok: true }),
    status: 200
  })) as any
}
