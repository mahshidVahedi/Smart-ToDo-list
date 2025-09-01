<template>
  <div class="p-4 flex flex-col items-center gap-4">
    <div v-if="!isGoogleLoggedIn">
      <button @click="handleGoogleLogin"
        class="flex items-center gap-2 px-5 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full shadow hover:scale-105 transition active:scale-95">
        <img src="/src/assets/google-icon.svg" alt="Google icon" class="w-5 h-5" />
        <span class="text-sm font-medium text-gray-700 dark:text-gray-200">ورود با گوگل</span>
      </button>
    </div>

    <div v-else class="flex flex-col items-center gap-2 w-full max-w-xl">
      <span class="text-sm text-gray-700 dark:text-gray-300 self-start">{{ displayName }} خوش اومدی 👋</span>

      <button @click="handleLogout" class="self-start mt-1 px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-full">
        خروج از حساب گوگل
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useTaskStore } from '../store/tasks'

/* ===== Debug logger ===== */
const stamp = () => new Date().toISOString().split('T')[1].slice(0,12)
const LOG = (...a) => console.log('[SYNC]', stamp(), ...a)
const WRN = (...a) => console.warn('[SYNC]', stamp(), ...a)
const ERR = (...a) => console.error('[SYNC]', stamp(), ...a)

/* ===== Singleton Guards ===== */
if (!window.__gapiInitPromise) window.__gapiInitPromise = null
if (!window.__gisReady) window.__gisReady = false
if (!window.__googleSync) window.__googleSync = { watchActive:false, processing:new Set() }

/* ===== State & Config ===== */
const taskStore = useTaskStore()
const userInfo = ref(null)
const isGoogleLoggedIn = ref(false)

let gapiVar = null
let tokenClient = null

const CLIENT_ID = '268843044005-30ogcrsfsfm9mbajqce1ekuon6lntbnm.apps.googleusercontent.com'
const SCOPES = [
  'openid','profile','email',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/calendar',
].join(' ')
const CALENDAR_ID = 'primary'
const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone
const listIdRef = ref('@default')

/* ===== Waiters ===== */
const waitForGoogleIdentity = () => new Promise(r=>{const t=()=>{if(window.google?.accounts?.oauth2) return r();setTimeout(t,100)};t()})
const waitForGapi = () => new Promise(r=>{const t=()=>{if(window.gapi?.load) return r();setTimeout(t,100)};t()})

/* ===== Auth storage ===== */
const setGapiToken = (t)=>{if(t&&gapiVar)gapiVar.client.setToken({access_token:t})}
const storeAccessToken = (t)=>t&&localStorage.setItem('googleAccessToken',t)
const getStoredAccessToken = ()=>localStorage.getItem('googleAccessToken')
const clearAuthState = ()=>{localStorage.removeItem('googleAccessToken');try{gapiVar?.client.setToken(null)}catch{}}

/* ===== Ensure clients ===== */
const ensureGapiClient = async ()=>{
  await waitForGoogleIdentity();await waitForGapi();gapiVar=window.gapi
  if(window.__gapiInitPromise) return window.__gapiInitPromise
  window.__gapiInitPromise=new Promise((resolve,reject)=>{
    gapiVar.load('client',async()=>{
      try{
        await gapiVar.client.init({
          discoveryDocs:[
            'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest',
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
          ]
        })
        resolve()
      }catch(e){reject(e)}
    })
  })
  return window.__gapiInitPromise
}
const ensureTokenClient = async ()=>{
  await ensureGapiClient();await waitForGoogleIdentity()
  if(window.__gisReady&&tokenClient) return tokenClient
  tokenClient=window.google.accounts.oauth2.initTokenClient({
    client_id:CLIENT_ID,scope:SCOPES,
    callback:(tr)=>{
      const token=tr?.access_token
      if(!token)return
      storeAccessToken(token);setGapiToken(token)
      isGoogleLoggedIn.value=true
    }
  })
  window.__gisReady=true
  return tokenClient
}
const getFreshAccessToken = ()=>new Promise(async(res,rej)=>{
  try{
    await ensureTokenClient()
    tokenClient.requestAccessToken({
      prompt:'',include_granted_scopes:true,
      callback:(tr)=>{
        const token=tr?.access_token
        if(!token)return rej(new Error('no token'))
        storeAccessToken(token);setGapiToken(token);res(token)
      }
    })
  }catch(e){rej(e)}
})

/* ===== Date utils ===== */
const pad2=(n)=>n.toString().padStart(2,'0')
const toLatinDigits=(s)=>(s??'').replace(/[۰-۹]/g,d=>'0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]).replace(/[٠-٩]/g,d=>'0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)])
const j2g = (jy, jm, jd) => {
  const { gy, gm, gd } = jalaali.toGregorian(jy, jm, jd);
  return [gy, gm, gd];
};
const isProbablyJalaliYear=(y)=>y>=1200&&y<=1599
const parseDateToGregorianYMD=(raw)=>{if(!raw)return null;let d=toLatinDigits(raw.trim()).replace(/[.]/g,'-').replace(/[\/]/g,'-');const m=d.match(/^(\d{3,4})-(\d{1,2})-(\d{1,2})$/);if(!m)return null;let y=+m[1],mo=+m[2],da=+m[3];return isProbablyJalaliYear(y)?(()=>{const[gy,gm,gd]=j2g(y,mo,da);return{y:gy,m:gm,d:gd}})():{y,m:mo,d:da}}
const parseTimeFlexible=(raw)=>{if(!raw)return{h:0,m:0,ok:false};let t=toLatinDigits(raw.trim());const tm=t.match(/^(\d{1,2}):(\d{1,2})$/);if(tm){const h=+tm[1],m=+tm[2];return(h>=0&&h<24&&m>=0&&m<60)?{h,m,ok:true}:{h:0,m:0,ok:false}}return{h:0,m:0,ok:false}}
const makeLocalDate=(rawDate,rawTime)=>{const ymd=parseDateToGregorianYMD(rawDate),hm=parseTimeFlexible(rawTime);if(!ymd||!hm.ok)return null;const dt=new Date(`${ymd.y}-${pad2(ymd.m)}-${pad2(ymd.d)}T${pad2(hm.h)}:${pad2(hm.m)}:00`);return isNaN(dt.getTime())?null:dt}
const toRFC3339Local=(dt)=>{const y=dt.getFullYear(),m=pad2(dt.getMonth()+1),d=pad2(dt.getDate()),hh=pad2(dt.getHours()),mi=pad2(dt.getMinutes()),ss=pad2(dt.getSeconds());const tz=-dt.getTimezoneOffset(),sign=tz>=0?'+':'-',tzh=pad2(Math.floor(Math.abs(tz)/60)),tzm=pad2(Math.abs(tz)%60);return `${y}-${m}-${d}T${hh}:${mi}:${ss}${sign}${tzh}:${tzm}`}
const addMinutes=(date,mins)=>new Date(date.getTime()+mins*60000)

/* ===== Queue & API helpers ===== */
const sleep=(ms)=>new Promise(r=>setTimeout(r,ms))
let queue=Promise.resolve()
const queuedCall=async(fn,label='')=>{
  if(!gapiVar)throw new Error('gapi not init')
  if(!getStoredAccessToken())await getFreshAccessToken()
  queue=queue.then(async()=>{
    await sleep(150);LOG('API',label,'→ start')
    try{const r=await fn();LOG('API',label,'✓',r);return r?.result||r}
    catch(e){ERR('API',label,'✗',e);throw e}
  })
  return queue
}

/* ===== Google APIs ===== */
const insertTask=(r)=>queuedCall(()=>gapiVar.client.tasks.tasks.insert({tasklist:listIdRef.value,resource:r}),'tasks.insert')
const updateTask=(id,r)=>queuedCall(()=>gapiVar.client.tasks.tasks.patch({tasklist:listIdRef.value,task:id,resource:r}),'tasks.patch')
const deleteTask=(id)=>queuedCall(()=>gapiVar.client.tasks.tasks.delete({tasklist:listIdRef.value,task:id}),'tasks.delete')
const insertEvent=(r)=>queuedCall(()=>gapiVar.client.calendar.events.insert({calendarId:CALENDAR_ID,resource:r}),'cal.insert')
const updateEvent=(id,r)=>queuedCall(()=>gapiVar.client.calendar.events.patch({calendarId:CALENDAR_ID,eventId:id,resource:r}),'cal.patch')
const deleteEvent=(id)=>queuedCall(()=>gapiVar.client.calendar.events.delete({calendarId:CALENDAR_ID,eventId:id}),'cal.delete')

/* ===== Mapping ===== */
const isCalendarLike=(t)=>!!(t?.date)
const localToGTask=(t)=>{const payload={title:(t?.title||'').trim()};if(t?.date&&t?.time){const dt=makeLocalDate(t.date,t.time);if(dt)payload.due=toRFC3339Local(dt)}return payload}
const localToGEvent=(t)=>{if(!t?.date)return null;const body={summary:(t?.title||'').trim()};if(t?.time){const s=makeLocalDate(t.date,t.time);if(!s)return body;const e=addMinutes(s,30);body.start={dateTime:toRFC3339Local(s),timeZone:TIMEZONE};body.end={dateTime:toRFC3339Local(e),timeZone:TIMEZONE}}else{const ymd=parseDateToGregorianYMD(t.date);if(!ymd)return body;const start=`${ymd.y}-${pad2(ymd.m)}-${pad2(ymd.d)}`;const next=new Date(new Date(`${start}T00:00:00`).getTime()+86400000);const end=`${next.getFullYear()}-${pad2(next.getMonth()+1)}-${pad2(next.getDate())}`;body.start={date:start};body.end={date:end}}return body}

/* ===== Store patch ===== */
const applySyncPatch=(id,patch)=>{
  if(typeof taskStore.updateTaskFromSync==='function')taskStore.updateTaskFromSync(id,patch)
  else taskStore.updateTask({id,...patch})
}

/* ===== Lock helper ===== */
const withLock=async(key,fn)=>{
  const S=window.__googleSync.processing
  if(S.has(key)){LOG('skip due to lock',key);return}
  S.add(key)
  try{return await fn()}finally{S.delete(key)}
}

/* ===== Watcher logic ===== */
const handleTasksDiffSafely=async(newList,oldList)=>{
  if(!isGoogleLoggedIn.value||!gapiVar)return
  const oldById=new Map((oldList||[]).map(t=>[t.id,t]))
  const newById=new Map((newList||[]).map(t=>[t.id,t]))
  const destOf=(t)=>isCalendarLike(t)?'CAL':'TASKS'

  // Add
  for(const t of newList){
    if(!oldById.has(t.id)){
      await withLock('add:'+t.id,async()=>{
        if(destOf(t)==='TASKS'){const r=await insertTask(localToGTask(t));applySyncPatch(t.id,{googleTaskId:r.id,googleEventId:null})}
        else{const r=await insertEvent(localToGEvent(t));applySyncPatch(t.id,{googleEventId:r.id,googleTaskId:null})}
      })
    }
  }
  // Update / Move
  for(const t of newList){
    const prev=oldById.get(t.id);if(!prev)continue
    const changed=prev.title!==t.title||prev.date!==t.date||prev.time!==t.time
    if(!changed)continue
    await withLock('upd:'+t.id,async()=>{
      const prevDest=destOf(prev),newDest=destOf(t)
      if(prevDest===newDest){
        if(newDest==='TASKS'){
          if(t.googleTaskId)await updateTask(t.googleTaskId,localToGTask(t))
          else{const r=await insertTask(localToGTask(t));applySyncPatch(t.id,{googleTaskId:r.id,googleEventId:null})}
        }else{
          if(t.googleEventId)await updateEvent(t.googleEventId,localToGEvent(t))
          else{const r=await insertEvent(localToGEvent(t));applySyncPatch(t.id,{googleEventId:r.id,googleTaskId:null})}
        }
      }else{
        if(prevDest==='TASKS'&&prev.googleTaskId)await deleteTask(prev.googleTaskId)
        if(prevDest==='CAL'&&prev.googleEventId)await deleteEvent(prev.googleEventId)
        if(newDest==='TASKS'){const r=await insertTask(localToGTask(t));applySyncPatch(t.id,{googleTaskId:r.id,googleEventId:null})}
        else{const r=await insertEvent(localToGEvent(t));applySyncPatch(t.id,{googleEventId:r.id,googleTaskId:null})}
      }
    })
  }
  // Delete
  for(const t of oldList||[]){
    if(!newById.has(t.id)){
      await withLock('del:'+t.id,async()=>{
        if(t.googleTaskId)await deleteTask(t.googleTaskId)
        if(t.googleEventId)await deleteEvent(t.googleEventId)
      })
    }
  }
}

/* ===== Watcher singleton ===== */
let stopWatcher=null
const registerWatcherOnce=()=>{
  if(window.__googleSync.watchActive)return
  window.__googleSync.watchActive=true
  stopWatcher=watch(()=>taskStore.tasks.slice(),handleTasksDiffSafely,{deep:false})
  onUnmounted(()=>{stopWatcher&&stopWatcher();window.__googleSync.watchActive=false})
}

/* ===== UI Actions ===== */
const handleGoogleLogin=async()=>{
  await ensureTokenClient()
  tokenClient.requestAccessToken({
    prompt:'select_account',include_granted_scopes:true,
    callback:async()=>{
      isGoogleLoggedIn.value=true
      await ensureTasklistId()
    }
  })
}
const handleLogout=()=>{userInfo.value=null;isGoogleLoggedIn.value=false;clearAuthState()}

/* ===== Mounted ===== */
onMounted(async()=>{
  await ensureGapiClient()
  registerWatcherOnce()
  if(getStoredAccessToken()){
    await getFreshAccessToken()
    isGoogleLoggedIn.value=true
    await ensureTasklistId()
  }
})

/* ===== Tasklist resolver ===== */
const ensureTasklistId=async()=>{
  const r=await queuedCall(()=>gapiVar.client.tasks.tasklists.list({maxResults:1}),'tasklists.list')
  if(r?.items?.length)listIdRef.value=r.items[0].id
}

/* ===== UI computed ===== */
const displayName=computed(()=>userInfo.value?.name||userInfo.value?.email||'دوست من')
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
