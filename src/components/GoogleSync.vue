<template>
  <div class="p-4 flex flex-col items-center gap-4">
    <div v-if="!userInfo">
      <button @click="handleGoogleLogin"
        class="flex items-center gap-2 px-5 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full shadow hover:scale-105 transition active:scale-95">
        <img src="/src/assets/google-icon.svg" alt="Google icon" class="w-5 h-5" />
        <span class="text-sm font-medium text-gray-700 dark:text-gray-200">ورود با گوگل</span>
      </button>
    </div>

    <div v-else class="flex flex-col items-center gap-2">
      <span class="text-sm text-gray-700 dark:text-gray-300">{{ userInfo.name }} خوش اومدی 👋</span>
      <button @click="handleLogout"
        class="px-4 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-full">
        خروج از حساب گوگل
      </button>
    </div>

    <SyncPromptModal v-if="showPrompt" @confirm="syncAllTasks" @cancel="cancelSyncPrompt" />

    <transition name="fade">
      <div v-if="toastMessage"
        class="fixed top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-xl shadow z-50 text-sm">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { gapi } from 'gapi-script'
import SyncPromptModal from './SyncPromptModal.vue'
import { useTaskStore } from '../store/tasks'

const showPrompt = ref(false)
const taskStore = useTaskStore()
const isGoogleLoggedIn = ref(false)
const toastMessage = ref('')
const userInfo = ref(null)
let tokenClient = null

const initGoogleApi = async () => {
  return new Promise((resolve, reject) => {
    gapi.load('client', async () => {
      try {
        await gapi.client.init({
          discoveryDocs: [
            'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
            'https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest'
          ]
        })

        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: '268843044005-30ogcrsfsfm9mbajqce1ekuon6lntbnm.apps.googleusercontent.com',
          scope: 'openid profile email https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks',
          callback: async (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
              localStorage.setItem('googleAccessToken', tokenResponse.access_token)
              isGoogleLoggedIn.value = true
              await fetchUserInfo(tokenResponse.access_token)
              const choice = localStorage.getItem('googleSyncChoice')
              if (choice === null) {
                showPrompt.value = true
              } else if (choice === 'yes') {
                syncAllTasks()
              }
              resolve()
            } else {
              reject('No access token')
            }
          }
        })
        resolve()
      } catch (err) {
        reject(err)
      }
    })
  })
}

const fetchUserInfo = async (accessToken) => {
  try {
    const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    const data = await res.json()
    userInfo.value = data
  } catch (err) {
    console.warn('Failed to fetch user info:', err)
  }
}

const handleGoogleLogin = async () => {
  try {
    await initGoogleApi()
    tokenClient.requestAccessToken({ prompt: 'select_account' })
  } catch (err) {
    console.error('Google login failed', err)
  }
}

const handleLogout = () => {
  userInfo.value = null
  isGoogleLoggedIn.value = false
  localStorage.removeItem('googleAccessToken')
  localStorage.removeItem('googleSyncChoice')
  showToast('از حساب گوگل خارج شدید')
}

const syncAllTasks = async () => {
  showPrompt.value = false
  const tasks = taskStore.tasks
  for (const task of tasks) {
    await syncSingleTask(task)
  }
}

const cancelSyncPrompt = () => {
  localStorage.setItem('googleSyncChoice', 'no')
  showPrompt.value = false
}

const syncSingleTask = async (task) => {
  try {
    if (!task.time && !task.duration) {
      await gapi.client.tasks.tasks.insert({
        tasklist: '@default',
        resource: { title: task.title }
      })
      showToast(`📝 تسک "${task.title}" به Google Tasks اضافه شد`)
    } else {
      const startTime = task.date && task.time ? `${task.date}T${task.time}:00` : null
      const endTime = startTime && task.duration
        ? new Date(new Date(startTime).getTime() + task.duration * 60000).toISOString()
        : null
      await gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: {
          summary: task.title,
          start: { dateTime: startTime },
          end: { dateTime: endTime || startTime }
        }
      })
      showToast(`📅 تسک "${task.title}" به Google Calendar اضافه شد`)
    }
  } catch (e) {
    console.warn('sync error:', e)
  }
}

watch(
  () => taskStore.tasks,
  async (newTasks, oldTasks) => {
    if (!isGoogleLoggedIn.value) return
    const addedTasks = newTasks.filter(t => !oldTasks.some(o => o.id === t.id))
    for (const task of addedTasks) {
      await syncSingleTask(task)
    }
  },
  { deep: true }
)

onMounted(async () => {
  const token = localStorage.getItem('googleAccessToken')
  if (token) {
    try {
      await initGoogleApi()
      isGoogleLoggedIn.value = true
      await fetchUserInfo(token)
      const choice = localStorage.getItem('googleSyncChoice')
      if (choice === 'yes') {
        syncAllTasks()
      }
    } catch (err) {
      console.warn('Auto-login failed:', err)
      handleLogout()
    }
  }
})

const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => (toastMessage.value = ''), 2500)
}
</script>
