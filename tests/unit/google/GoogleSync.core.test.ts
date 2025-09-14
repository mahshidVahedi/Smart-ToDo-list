import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

class LocalStorageMock {
  store: Record<string, string> = {}
  clear() { this.store = {} }
  getItem(k: string) { return this.store[k] ?? null }
  setItem(k: string, v: string) { this.store[k] = String(v) }
  removeItem(k: string) { delete this.store[k] }
}
vi.stubGlobal('localStorage', new LocalStorageMock())

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

let tokenClientRef: any = null
vi.stubGlobal('google', {
  accounts: {
    oauth2: {
      initTokenClient: vi.fn((_opts) => {
        tokenClientRef = {
          callback: (_: any) => {},
          requestAccessToken: vi.fn((_req) => {
            tokenClientRef.callback({ access_token: 'TEST_TOKEN', expires_in: 3600 })
          }),
        }
        return tokenClientRef
      }),
    },
  },
})


const gapiClient = {
  setToken: vi.fn(),
  init: vi.fn().mockResolvedValue({}),
  tasks: {
    tasklists: {
      list: vi.fn().mockResolvedValue({ result: { items: [{ id: 'LIST_1' }] } }),
    },
    tasks: {
      insert: vi.fn().mockResolvedValue({ result: { id: 'GTASK_123' } }),
      patch: vi.fn().mockResolvedValue({ result: { id: 'GTASK_123' } }),
      delete: vi.fn().mockResolvedValue({}),
    },
  },
  calendar: {
    events: {
      insert: vi.fn().mockResolvedValue({ result: { id: 'GEVT_A' } }),
      patch: vi.fn().mockResolvedValue({ result: { id: 'GEVT_A' } }),
      delete: vi.fn().mockResolvedValue({}),
    },
  },
}

vi.stubGlobal('gapi', {
  load: vi.fn((name, cb) => cb && cb()),
  client: gapiClient,
})

const storeState = {
  tasks: [] as any[],
  projects: [{ id: 0, name: 'پیش‌فرض' }],
  updateTask: vi.fn(),
  updateTaskFromSync: vi.fn(),
  $subscribe: vi.fn((cb, _opts) => {
    storeState.__sub = cb
  }),
  __sub: undefined as any,
}
vi.mock('../../../src/store/tasks', () => ({
  useTaskStore: () => storeState,
}))

const importSyncModule = async () => {
  const mod = await import('../../../src/sync/GoogleSync.js')
  return mod as any
}

beforeEach(() => {
  vi.clearAllMocks()
  ;(localStorage as any).clear()
  storeState.tasks = []
  storeState.updateTask.mockReset()
  storeState.updateTaskFromSync.mockReset()
  mockFetch.mockReset()
  gapiClient.tasks.tasklists.list.mockResolvedValue({ result: { items: [{ id: 'LIST_1' }] } })
  gapiClient.tasks.tasks.insert.mockResolvedValue({ result: { id: 'GTASK_123' } })
  gapiClient.calendar.events.insert.mockResolvedValue({ result: { id: 'GEVT_A' } })
})

afterEach(() => {
})

describe('GoogleSync core flow', () => {
  it('googleLogout: باید حالت‌ها و localStorage را پاک کند', async () => {
    const { googleLogout, isGoogleLoggedIn, displayName } = await importSyncModule()

    isGoogleLoggedIn.value = true
    displayName.value = 'کابر تستی'
    localStorage.setItem('googleAccessToken', 'TOK')
    localStorage.setItem('googleTokenExpMs', '123')
    localStorage.setItem('googleLoginGranted', '1')

    googleLogout()

    expect(isGoogleLoggedIn.value).toBe(false)
    expect(displayName.value).toBe('دوست من')
    expect(localStorage.getItem('googleAccessToken')).toBeNull()
    expect(localStorage.getItem('googleTokenExpMs')).toBeNull()
  })

  it('tryLoadUserInfo: اگر token باشد و fetch موفق، displayName آپدیت شود', async () => {
    const { tryLoadUserInfo, displayName } = await importSyncModule()
    localStorage.setItem('googleAccessToken', 'TOK')

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'حمید تستی', email: 'h@test.com' }),
    } as any)

    await tryLoadUserInfo()
    expect(displayName.value).toBe('حمید تستی')
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })


})
