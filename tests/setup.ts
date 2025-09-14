// tests/setup.ts
import { vi } from 'vitest'

// localStorage mock
class LocalStorageMock {
  store = {}
  clear() { this.store = {} }
  getItem(key) { return this.store[key] || null }
  setItem(key, value) { this.store[key] = String(value) }
  removeItem(key) { delete this.store[key] }
}
vi.stubGlobal('localStorage', new LocalStorageMock())

vi.stubGlobal('gapi', {
  load: vi.fn((_, cb) => cb && cb()),
  client: {
    init: vi.fn().mockResolvedValue({}),
    request: vi.fn(),
    calendar: { events: { insert: vi.fn(), update: vi.fn(), delete: vi.fn() } }
  },
  auth2: {
    getAuthInstance: vi.fn(() => ({
      signIn: vi.fn(),
      signOut: vi.fn(),
      isSignedIn: { get: vi.fn(() => false) },
      currentUser: { get: vi.fn(() => ({ getAuthResponse: () => ({ access_token: 'x' }) })) }
    }))
  }
})

class ResizeObserverMock { observe(){} unobserve(){} disconnect(){} }
vi.stubGlobal('ResizeObserver', ResizeObserverMock)

vi.stubGlobal('matchMedia', vi.fn().mockImplementation((q) => ({
  matches: false, media: q, onchange: null,
  addListener: vi.fn(), removeListener: vi.fn(),
  addEventListener: vi.fn(), removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
})))
