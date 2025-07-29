<template>
  <div class="p-4 flex flex-col items-center gap-4">
    <button @click="handleGoogleLogin"
      class="flex items-center gap-2 px-5 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full shadow hover:scale-105 transition active:scale-95">
      <img src="/src/assets/google-icon.svg" alt="Google icon" class="w-5 h-5" />
      <span class="text-sm font-medium text-gray-700 dark:text-gray-200">ورود با گوگل</span>
    </button>

    <SyncPromptModal
      v-if="showPrompt"
      @confirm="syncAllTasks"
      @cancel="showPrompt = false"
    />

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
import { ref, watch } from 'vue'
import { gapi } from 'gapi-script'
import SyncPromptModal from './SyncPromptModal.vue'
import { useTaskStore } from '../store/tasks'

const showPrompt = ref(false)
const taskStore = useTaskStore()
const isGoogleLoggedIn = ref(false)
const toastMessage = ref('')

const initGoogleApi = () => {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', () => {
      gapi.client.init({
        clientId: '268843044005-30ogcrsfsfm9mbajqce1ekuon6lntbnm.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks'
      })
        .then(resolve)
        .catch(reject)
    })
  })
}

const handleGoogleLogin = async () => {
  try {
    await initGoogleApi()
    const authInstance = gapi.auth2.getAuthInstance()
    await authInstance.signIn()
    const user = authInstance.currentUser.get()
    const isAuthorized = user.hasGrantedScopes(
      'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/tasks'
    )

    if (isAuthorized) {
      isGoogleLoggedIn.value = true
      showPrompt.value = true
    }
  } catch (err) {
    console.error('Google login failed', err)
  }
}

const syncAllTasks = async () => {
  showPrompt.value = false
  const tasks = taskStore.tasks

  for (const task of tasks) {
    await syncSingleTask(task)
  }
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

const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => (toastMessage.value = ''), 2500)
}
</script>
