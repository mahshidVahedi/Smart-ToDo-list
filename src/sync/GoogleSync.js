import { ref } from 'vue'
import { useTaskStore } from '../store/tasks'
import * as jalaali from 'jalaali-js'

/* ===== Debug ===== */
const stamp = () => new Date().toISOString().split('T')[1].slice(0, 12)
const LOG  = (...a) => console.log('[SYNC]', stamp(), ...a)
const WRN  = (...a) => console.warn('[SYNC]', stamp(), ...a)
const ERR  = (...a) => console.error('[SYNC]', stamp(), ...a)

/* ===== Globals ===== */
if (!window.__gapiInitPromise) window.__gapiInitPromise = null
if (!window.__gisReady) window.__gisReady = false
if (!window.__googleSync) window.__googleSync = {
  processing: new Set(),
  subscribed: false,
  prevTasks: [],
  syncArmed: false,
  refreshTimer: null,
  inited: false,
}

const CLIENT_ID = '268843044005-30ogcrsfsfm9mbajqce1ekuon6lntbnm.apps.googleusercontent.com'
const SCOPES = [
  'openid', 'profile', 'email',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/calendar',
].join(' ')

const TIMEZONE = 'Asia/Tehran'
const CALENDAR_ID = 'primary'

const LS_TOKEN = 'googleAccessToken'
const LS_LOGIN_FLAG = 'googleLoginGranted'
const LS_EXP = 'googleTokenExpMs' 
/* ===== Reactive for UI ===== */
export const isGoogleLoggedIn = ref(false)
export const displayName = ref('دوست من')

/* ===== Locals ===== */
let gapiVar = null
let tokenClient = null
let queue = Promise.resolve()
let listId = '@default'

/* ===== Utils ===== */
const sleep = (ms) => new Promise(r => setTimeout(r, ms))
const nowMs = () => Date.now()
const safeClone = (arr) => {
  try { return JSON.parse(JSON.stringify(arr ?? [])) }
  catch { return Array.isArray(arr) ? arr.map(x => ({ ...x })) : [] }
}
const pad2 = (n) => n.toString().padStart(2, '0')
const toLatinDigits = (s) => (s ?? '')
  .replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)])
  .replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])

const safeToGregorian = (jy, jm, jd) => {
  try {
    const api = (jalaali && typeof jalaali.toGregorian === 'function')
      ? jalaali
      : (window.jalaali && typeof window.jalaali.toGregorian === 'function' ? window.jalaali : null)
    if (!api) throw new Error('jalaali-js missing')
    const { gy, gm, gd } = api.toGregorian(jy, jm, jd)
    return [gy, gm, gd]
  } catch { return [jy, jm, jd] }
}
const isProbablyJalaliYear = (y) => y >= 1200 && y <= 1599
const parseDateToGregorianYMD = (raw) => {
  if (!raw) return null
  let d = toLatinDigits(raw.trim()).replace(/[.]/g, '-').replace(/[\/]/g, '-')
  const m = d.match(/^(\d{3,4})-(\d{1,2})-(\d{1,2})$/)
  if (!m) return null
  let y = +m[1], mo = +m[2], da = +m[3]
  if (isProbablyJalaliYear(y)) { const [gy, gm, gd] = safeToGregorian(y, mo, da); return { y: gy, m: gm, d: gd } }
  return { y, m: mo, d: da }
}
const parseTimeFlexible = (raw) => {
  if (!raw) return { h: 0, m: 0, ok: false }
  let t = toLatinDigits(raw.trim())
  const tm = t.match(/^(\d{1,2}):(\d{1,2})$/)
  if (tm) {
    const h = +tm[1], m = +tm[2]
    return (h >= 0 && h < 24 && m >= 0 && m < 60) ? { h, m, ok: true } : { h: 0, m: 0, ok: false }
  }
  return { h: 0, m: 0, ok: false }
}
const parseTimeRangeString = (raw) => {
  if (!raw) return null
  let s = toLatinDigits(String(raw).trim())
  s = s.replace(/\s*(?:تا|الی|to)\s*/gi, '-')
  const m = s.match(/^(\d{1,2})(?::(\d{1,2}))?\s*[-–—~]\s*(\d{1,2})(?::(\d{1,2}))?$/)
  if (!m) return null
  const sh = +m[1], sm = +(m[2] ?? 0), eh = +m[3], em = +(m[4] ?? 0)
  const ok = (h, m) => h >= 0 && h < 24 && m >= 0 && m < 60
  return (ok(sh, sm) && ok(eh, em)) ? { sh, sm, eh, em } : null
}
const makeLocalDate = (rawDate, rawTime) => {
  const ymd = parseDateToGregorianYMD(rawDate), hm = parseTimeFlexible(rawTime)
  if (!ymd || !hm.ok) return null
  const dt = new Date(`${ymd.y}-${pad2(ymd.m)}-${pad2(ymd.d)}T${pad2(hm.h)}:${pad2(hm.m)}:00`)
  return isNaN(dt.getTime()) ? null : dt
}
const toRFC3339Local = (dt) => {
  const y = dt.getFullYear(), m = pad2(dt.getMonth() + 1), d = pad2(dt.getDate())
  const hh = pad2(dt.getHours()), mi = pad2(dt.getMinutes()), ss = pad2(dt.getSeconds())
  const tz = -dt.getTimezoneOffset(), sign = tz >= 0 ? '+' : '-'
  const tzh = pad2(Math.floor(Math.abs(tz) / 60)), tzm = pad2(Math.abs(tz) % 60)
  return `${y}-${m}-${d}T${hh}:${mi}:${ss}${sign}${tzh}:${tzm}`
}
const addMinutes = (date, mins) => new Date(date.getTime() + mins * 60000)

/* ===== Google boot ===== */
const waitForGoogleIdentity = () => new Promise(r => { const t = () => { if (window.google?.accounts?.oauth2) return r(); setTimeout(t, 100) }; t() })
const waitForGapi = () => new Promise(r => { const t = () => { if (window.gapi?.load) return r(); setTimeout(t, 100) }; t() })

const ensureGapiClient = async () => {
  await waitForGoogleIdentity(); await waitForGapi(); gapiVar = window.gapi
  if (window.__gapiInitPromise) return window.__gapiInitPromise
  window.__gapiInitPromise = new Promise((resolve, reject) => {
    gapiVar.load('client', async () => {
      try {
        await gapiVar.client.init({
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest',
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
          ]
        })
        resolve(null)
      } catch (e) { reject(e) }
    })
  })
  return window.__gapiInitPromise
}

const ensureTokenClient = async () => {
  await ensureGapiClient(); await waitForGoogleIdentity()
  if (window.__gisReady && tokenClient) return tokenClient
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
  })
  window.__gisReady = true
  return tokenClient
}

/* ===== Token storage/helpers ===== */
const setGapiToken = (t) => { if (t && gapiVar) gapiVar.client.setToken({ access_token: t }) }
const storeAccessToken = (t, expSec) => {
  if (!t) return
  localStorage.setItem(LS_TOKEN, t)
  const expMs = expSec ? (nowMs() + (expSec * 1000) - 120000) : (nowMs() + 55 * 60 * 1000)
  localStorage.setItem(LS_EXP, String(expMs))
}
const getStoredAccessToken = () => localStorage.getItem(LS_TOKEN)
const getStoredExpMs = () => +(localStorage.getItem(LS_EXP) || 0)
const setLoginFlag = (v) => localStorage.setItem(LS_LOGIN_FLAG, v ? '1' : '0')
const getLoginFlag = () => localStorage.getItem(LS_LOGIN_FLAG) === '1'
const clearAuthState = () => { localStorage.removeItem(LS_TOKEN); localStorage.removeItem(LS_EXP); try { gapiVar?.client.setToken(null) } catch { } }

const armAutoRefresh = () => {
  try { clearInterval(window.__googleSync.refreshTimer) } catch { }
  window.__googleSync.refreshTimer = setInterval(async () => {
    if (!isGoogleLoggedIn.value) return
    try { LOG('auto-refresh token'); await requestToken({ prompt: '' }) }
    catch (e) { WRN('auto-refresh failed', e?.message || e) }
  }, 50 * 60 * 1000)
}

/* ===== Token flow ===== */
const requestToken = (opts = {}) => new Promise(async (resolve, reject) => {
  try {
    await ensureTokenClient()
    tokenClient.callback = (tr) => {
      const token = tr?.access_token
      const exp = tr?.expires_in
      if (!token) return reject(new Error('no token'))
      storeAccessToken(token, exp)
      setGapiToken(token)
      isGoogleLoggedIn.value = true
      setLoginFlag(true)
      armAutoRefresh()
      resolve(token)
    }
    tokenClient.requestAccessToken({ include_granted_scopes: true, ...opts })
  } catch (e) { reject(e) }
})

const bootstrapLoginFromStorage = () => {
  const t = getStoredAccessToken()
  if (!t) return false
  setGapiToken(t)
  isGoogleLoggedIn.value = true
  if (!getLoginFlag()) setLoginFlag(true)
  armAutoRefresh()
  return true
}

const silentLogin = async () => {
  try { await requestToken({ prompt: '' }); return true }
  catch (e) {
    WRN('silent login failed', e?.message || e)
    return bootstrapLoginFromStorage()
  }
}

/* ===== Queue with 401 recovery ===== */
const queuedCall = (fn, label = '') => {
  const runner = async () => {
    if (!gapiVar) throw new Error('gapi not init')
    if (!getStoredAccessToken()) { await silentLogin().catch(() => { }) }
    const exp = getStoredExpMs()
    if (exp && exp < nowMs()) { await requestToken({ prompt: '' }).catch(() => { }) }

    await sleep(100)
    LOG('API', label, '→ start')
    try {
      const r = await fn(); LOG('API', label, '✓', r)
      return r?.result || r
    } catch (e) {
      const code = e?.status || e?.result?.error?.code
      if (code === 401) {
        WRN('API', label, '401 → refresh & retry')
        await requestToken({ prompt: '' })
        const r2 = await fn(); LOG('API', label, '✓ retry', r2)
        return r2?.result || r2
      }
      ERR('API', label, '✗', e); throw e
    }
  }
  queue = queue.catch(() => null).then(runner)
  return queue
}

/* ===== Google APIs ===== */
const ensureTasklistId = async () => {
  const r = await queuedCall(() => gapiVar.client.tasks.tasklists.list({ maxResults: 1 }), 'tasklists.list')
  listId = r?.items?.[0]?.id || '@default'
}
const insertTask  = (r) => queuedCall(() => gapiVar.client.tasks.tasks.insert({ tasklist: listId, resource: r }), 'tasks.insert')
const updateTask  = (id, r) => queuedCall(() => gapiVar.client.tasks.tasks.patch({ tasklist: listId, task: id, resource: r }), 'tasks.patch')
const deleteTask  = (id) => queuedCall(() => gapiVar.client.tasks.tasks.delete({ tasklist: listId, task: id }), 'tasks.delete')
const insertEvent = (r) => queuedCall(() => gapiVar.client.calendar.events.insert({ calendarId: CALENDAR_ID, resource: r }), 'cal.insert')
const updateEvent = (id, r) => queuedCall(() => gapiVar.client.calendar.events.patch({ calendarId: CALENDAR_ID, eventId: id, resource: r }), 'cal.patch')
const deleteEvent = (id) => queuedCall(() => gapiVar.client.calendar.events.delete({ calendarId: CALENDAR_ID, eventId: id }), 'cal.delete')

/* ===== Time window helpers ===== */
const isCalendarLike = (t) => !!t?.date

const parseTimeHHMM = (raw) => {
  const t = parseTimeFlexible(raw)
  return t.ok ? { h: t.h, m: t.m } : null
}

const coerceTimeRanges = (input) => {
  if (!input) return []
  if (Array.isArray(input)) {
    const out = []
    for (const it of input) {
      const r = coerceTimeRanges(it)
      if (Array.isArray(r)) out.push(...r)
      else if (r) out.push(r)
    }
    return out
  }
  if (typeof input === 'string') {
    const r = parseTimeRangeString(input)
    return r ? [r] : []
  }
  if (typeof input === 'object') {
    const f = input.from ?? input.start ?? input.begin
    const t = input.to ?? input.end ?? input.finish
    if (!f || !t) return []
    const s = parseTimeHHMM(f)
    const e = parseTimeHHMM(t)
    if (!s || !e) return []
    return [{ sh: s.h, sm: s.m, eh: e.h, em: e.m }]
  }
  return []
}

const extractRangesFromTask = (t) => {
  if (t?.timeRanges) return coerceTimeRanges(t.timeRanges)
  if (t?.timeRange)  return coerceTimeRanges(t.timeRange)
  if (t?.from && t?.to) return coerceTimeRanges({ from: t.from, to: t.to })
  return []
}

const getStartEndDateTimes = (t) => {
  const startDate = t?.date || null
  const endDate   = t?.endDate || null
  if (!startDate) return { allDay: false, start: null, end: null }

  const ranges = extractRangesFromTask(t)
  if (ranges.length > 0) {
    const r0 = ranges[0]
    const s = makeLocalDate(startDate, `${pad2(r0.sh)}:${pad2(r0.sm)}`)
    const e = makeLocalDate(endDate || startDate, `${pad2(r0.eh)}:${pad2(r0.em)}`)
    if (s && e) return { allDay: false, start: s, end: e }
  }

  const time = t?.time || null
  if (time) {
    const sdt = makeLocalDate(startDate, time)
    if (!sdt) return { allDay: false, start: null, end: null }
    const edt = addMinutes(sdt, 30)
    return { allDay: false, start: sdt, end: edt }
  }

  const ymd = parseDateToGregorianYMD(startDate)
  if (!ymd) return { allDay: false, start: null, end: null }
  const startStr = `${ymd.y}-${pad2(ymd.m)}-${pad2(ymd.d)}`
  let endStr
  if (endDate) {
    const y2 = parseDateToGregorianYMD(endDate)
    if (!y2) return { allDay: false, start: null, end: null }
    const endDt = new Date(`${y2.y}-${pad2(y2.m)}-${pad2(y2.d)}T00:00:00`)
    endStr = `${endDt.getFullYear()}-${pad2(endDt.getMonth() + 1)}-${pad2(endDt.getDate())}`
    const next = new Date(endDt.getTime() + 86400000)
    endStr = `${next.getFullYear()}-${pad2(next.getMonth() + 1)}-${pad2(next.getDate())}`
  } else {
    const next = new Date(new Date(`${startStr}T00:00:00`).getTime() + 86400000)
    endStr = `${next.getFullYear()}-${pad2(next.getMonth() + 1)}-${pad2(next.getDate())}`
  }
  return { allDay: true, start: startStr, end: endStr }
}

const localToGTask = (t) => {
  const payload = { title: (t?.title || '').trim() }

  let startTime = t?.time || null
  if (!startTime) {
    const ranges = extractRangesFromTask(t)
    if (ranges.length) startTime = `${pad2(ranges[0].sh)}:${pad2(ranges[0].sm)}`
  }

  if (t?.date && startTime) {
    const dt = makeLocalDate(t.date, startTime)
    if (dt) payload.due = toRFC3339Local(dt)
  }
  return payload
}

const buildEventsForTask = (t) => {
  if (!t?.date) return []

  const summary = (t?.title || '').trim()
  const events = []

  const ranges = extractRangesFromTask(t)
  if (ranges.length > 0) {
    for (const r of ranges) {
      const sdt = makeLocalDate(t.date, `${pad2(r.sh)}:${pad2(r.sm)}`)
      const edt = makeLocalDate(t.endDate || t.date, `${pad2(r.eh)}:${pad2(r.em)}`)
      if (!sdt || !edt) continue
      events.push({
        summary,
        start: { dateTime: toRFC3339Local(sdt), timeZone: TIMEZONE },
        end:   { dateTime: toRFC3339Local(edt), timeZone: TIMEZONE },
      })
    }
    return events
  }

  if (t?.time) {
    const sdt = makeLocalDate(t.date, t.time)
    if (sdt) {
      const edt = addMinutes(sdt, 30)
      events.push({
        summary,
        start: { dateTime: toRFC3339Local(sdt), timeZone: TIMEZONE },
        end:   { dateTime: toRFC3339Local(edt), timeZone: TIMEZONE },
      })
    }
    return events
  }

  // All-day
  const win = getStartEndDateTimes(t)
  if (win.allDay && win.start && win.end) {
    events.push({
      summary,
      start: { date: win.start },
      end:   { date: win.end },
    })
  }
  return events
}

/* ===== Store patch ===== */
const applySyncPatch = (id, patch) => {
  const store = useTaskStore()
  if (typeof store.updateTaskFromSync === 'function') store.updateTaskFromSync(id, patch)
  else store.updateTask({ id, ...patch })
}

/* ===== Lock helper ===== */
const withLock = async (key, fn) => {
  const S = window.__googleSync.processing
  if (S.has(key)) { LOG('skip due to lock', key); return }
  S.add(key)
  try { return await fn() } finally { S.delete(key) }
}

/* ===== helpers for event ids (array-compatible) ===== */
const getEventIdsFromTask = (t) => {
  const arr = Array.isArray(t?.googleEventIds) ? t.googleEventIds.filter(Boolean) : []
  if (!arr.length && t?.googleEventId) arr.push(t.googleEventId)
  return arr
}
const makeEventIdsPatch = (ids) => ({ googleEventIds: ids, googleEventId: ids[0] || null })

/* ===== Diff equality ===== */
const equalCore = (a, b) => {
  const aTR = a.timeRanges ?? a.timeRange ?? null
  const bTR = b.timeRanges ?? b.timeRange ?? null
  const aTRs = JSON.stringify(aTR)
  const bTRs = JSON.stringify(bTR)
  return a.title === b.title &&
    a.date === b.date &&
    a.time === b.time &&
    aTRs === bTRs &&
    (a.endDate || null) === (b.endDate || null) &&
    (a.endTime || a.timeEnd || null) === (b.endTime || b.timeEnd || null) &&
    (+a.durationMinutes || 0) === (+b.durationMinutes || 0) &&
    a.completed === b.completed &&
    a.projectId === b.projectId
}

/* ===== Core sync ops for CAL ===== */
const recreateAllEventsForTask = async (t) => {
  const prevIds = getEventIdsFromTask(t)
  if (prevIds.length) {
    LOG('cal.recreate: delete prev', t.id, prevIds)
    for (const id of prevIds) {
      try { await deleteEvent(id) } catch (e) { WRN('cal.delete failed', id, e?.message || e) }
    }
  }

  const resources = buildEventsForTask(t)
  const newIds = []
  for (const res of resources) {
    const r = await insertEvent(res)
    if (r?.id) newIds.push(r.id)
  }

  applySyncPatch(t.id, makeEventIdsPatch(newIds))
  return newIds
}

/* ===== Diff & Sync ===== */
const initialSyncUpsertAll = async (list = []) => {
  for (const t of list) {
    const dest = isCalendarLike(t) ? 'CAL' : 'TASKS'

    if (dest === 'TASKS') {
      const prevIds = getEventIdsFromTask(t)
      if (prevIds.length) {
        await withLock('init-del-events:' + t.id, async () => {
          for (const id of prevIds) { try { await deleteEvent(id) } catch (e) { WRN('del event fail', id, e?.message||e) } }
          applySyncPatch(t.id, makeEventIdsPatch([]))
        })
      }
      if (!t.googleTaskId) {
        await withLock('init-add-task:' + t.id, async () => {
          const r = await insertTask(localToGTask(t))
          applySyncPatch(t.id, { googleTaskId: r.id })
        })
      } else {
        await withLock('init-upd-task:' + t.id, async () => {
          await updateTask(t.googleTaskId, localToGTask(t))
        })
      }
    } else {
      // CAL
      if (t.googleTaskId) {
        await withLock('init-del-task:' + t.id, async () => {
          await deleteTask(t.googleTaskId)
          applySyncPatch(t.id, { googleTaskId: null })
        })
      }
      await withLock('init-recreate-events:' + t.id, async () => {
        await recreateAllEventsForTask(t)
      })
    }
  }
}

const handleTasksDiffSafely = async (newList = [], oldList = []) => {
  if (!isGoogleLoggedIn.value || !gapiVar) return
  const oldById = new Map(oldList.map(t => [t.id, t]))
  const newById = new Map(newList.map(t => [t.id, t]))
  const destOf = (t) => isCalendarLike(t) ? 'CAL' : 'TASKS'

  // Add
  for (const t of newList) {
    if (!oldById.has(t.id)) {
      await withLock('add:' + t.id, async () => {
        const dest = destOf(t)
        if (dest === 'TASKS') {
          const r = await insertTask(localToGTask(t))
          applySyncPatch(t.id, { googleTaskId: r.id, ...makeEventIdsPatch([]) })
        } else {
          await recreateAllEventsForTask(t)
          applySyncPatch(t.id, { googleTaskId: null })
        }
      })
    }
  }

  // Update / Move
  for (const t of newList) {
    const prev = oldById.get(t.id); if (!prev) continue
    if (equalCore(prev, t)) continue
    await withLock('upd:' + t.id, async () => {
      const prevDest = destOf(prev), newDest = destOf(t)
      if (prevDest === newDest) {
        if (newDest === 'TASKS') {
          if (t.googleTaskId) await updateTask(t.googleTaskId, localToGTask(t))
          else { const r = await insertTask(localToGTask(t)); applySyncPatch(t.id, { googleTaskId: r.id }) }

          const prevIds = getEventIdsFromTask(t)
          if (prevIds.length) {
            for (const id of prevIds) { try { await deleteEvent(id) } catch {} }
            applySyncPatch(t.id, makeEventIdsPatch([]))
          }
        } else {
          await recreateAllEventsForTask(t)
          if (t.googleTaskId) { try { await deleteTask(t.googleTaskId) } catch {} ; applySyncPatch(t.id, { googleTaskId: null }) }
        }
      } else {
        if (prevDest === 'TASKS' && prev.googleTaskId) await deleteTask(prev.googleTaskId)
        if (prevDest === 'CAL') {
          const ids = getEventIdsFromTask(prev)
          for (const id of ids) { try { await deleteEvent(id) } catch {} }
        }

        if (newDest === 'TASKS') {
          const r = await insertTask(localToGTask(t))
          applySyncPatch(t.id, { googleTaskId: r.id, ...makeEventIdsPatch([]) })
        } else {
          await recreateAllEventsForTask(t)
          applySyncPatch(t.id, { googleTaskId: null })
        }
      }
    })
  }

  // Delete
  for (const t of oldList) {
    if (!newById.has(t.id)) {
      await withLock('del:' + t.id, async () => {
        if (t.googleTaskId) { try { await deleteTask(t.googleTaskId) } catch {} }
        const ids = getEventIdsFromTask(t)
        for (const id of ids) { try { await deleteEvent(id) } catch {} }
      })
    }
  }
}

/* ===== Public API ===== */
export const googleLogin = async () => {
  await requestToken({ prompt: 'select_account' })
  await ensureTasklistId()
  await tryLoadUserInfo()

  const store = useTaskStore()
  const newList = store.tasks || []
  await initialSyncUpsertAll(newList)
  window.__googleSync.prevTasks = safeClone(newList)
  window.__googleSync.syncArmed = true
}

export const googleLogout = () => {
  displayName.value = 'دوست من'
  isGoogleLoggedIn.value = false
  setLoginFlag(false)
  clearAuthState()
  try { clearInterval(window.__googleSync.refreshTimer) } catch { }
}

export const tryLoadUserInfo = async () => {
  try {
    const t = getStoredAccessToken(); if (!t) return
    const resp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${t}` }
    })
    if (resp.ok) {
      const u = await resp.json()
      displayName.value = u?.name || u?.email || 'دوست من'
    }
  } catch (e) { WRN('userinfo failed', e?.message || e) }
}

/* ===== INIT (call once globally) ===== */
export const initGoogleSync = async () => {
  if (window.__googleSync.inited) return
  window.__googleSync.inited = true

  const store = useTaskStore()
  window.__googleSync.prevTasks = safeClone(store.tasks || [])
  window.__googleSync.syncArmed = false

  if (!window.__googleSync.subscribed) {
    store.$subscribe(
      async (_mutation, state) => {
        const newList = state.tasks || []
        if (!isGoogleLoggedIn.value) {
          window.__googleSync.prevTasks = safeClone(newList)
          return
        }
        const oldList = window.__googleSync.syncArmed ? (window.__googleSync.prevTasks || []) : []
        window.__googleSync.syncArmed = true
        await handleTasksDiffSafely(newList, oldList)
        window.__googleSync.prevTasks = safeClone(newList)
      },
      { detached: true } 
    )
    window.__googleSync.subscribed = true
    LOG('SUB installed (detached, global)')
  }

  await ensureGapiClient()

  const hadToken = bootstrapLoginFromStorage()
  if (getLoginFlag() || hadToken) {
    await silentLogin()
    if (isGoogleLoggedIn.value) {
      await ensureTasklistId()
      await tryLoadUserInfo()
      const newList = store.tasks || []
      await initialSyncUpsertAll(newList)
      window.__googleSync.prevTasks = safeClone(newList)
      window.__googleSync.syncArmed = true
    }
  }
}
