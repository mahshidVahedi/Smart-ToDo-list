<template>
  <div class="relative min-h-screen overflow-hidden text-gray-900 dark:text-gray-100">

    <div
      class="md:hidden fixed inset-0 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 z-[-1]">
    </div>

    <img src="/images/bg-light.jpg" alt="Light Background"
      class="hidden md:block w-full h-full object-cover blur-sm opacity-60 dark:hidden absolute inset-0 -z-10" />
    <img src="/images/bg-dark.jpg" alt="Dark Background"
      class="hidden md:block w-full h-full object-cover blur-sm opacity-50 dark:block absolute inset-0 -z-10" />
    <div class="hidden md:block absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-[2px] -z-10"></div>

    <ProjectSidebarMobile v-if="sidebarOpen && windowWidth < 768" :projects="taskStore.projects"
      :selected-id="taskStore.selectedProjectId" :is-dark="isDark" @select-project="taskStore.selectProject"
      @add-project="addProject" @delete-project="deleteProject" @toggle-theme="toggleDark"
      @close="sidebarOpen = false" />


    <div v-if="toastMessage"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-600 text-white rounded-xl shadow z-50">
      {{ toastMessage }}
    </div>

    <button @click="toggleDark"
      class="hidden md:block fixed top-4 left-4 z-50 p-2 px-3 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-full shadow hover:scale-105 transition">
      {{ isDark ? '☀️ روشن' : '🌙 تاریک' }}
    </button>

    <button v-if="!sidebarOpen" @click="sidebarOpen = true"
      class="md:hidden fixed top-4 right-4 z-50 p-2 px-3 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-full shadow hover:scale-105 transition">
      ☰
    </button>

    <div class="relative z-10 transition-colors duration-300">
      <div
        class="flex flex-col md:flex-row gap-2 sm:gap-4 md:gap-6 p-2 sm:p-4 md:p-6 w-full max-w-full md:max-w-7xl mx-auto">

        <ProjectSidebar v-if="windowWidth >= 768" :projects="taskStore.projects"
          :selected-id="taskStore.selectedProjectId" :is-dark="isDark" @select-project="taskStore.selectProject"
          @add-project="addProject" @delete-project="deleteProject" @move-task-to-project="handleTaskMove"
          @toggle-theme="toggleDark" @close="sidebarOpen = false" />

        <div
          class="flex-1 space-y-3 sm:space-y-4 md:space-y-6 bg-gray-50 dark:bg-gray-950 md:bg-white/70 md:dark:bg-gray-900/70 md:backdrop-blur-md p-3 sm:p-4 md:p-6 rounded-2xl shadow-md">
          <h1
            class="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-white tracking-tight">
            {{ activeProjectName }}
          </h1>

          <TaskStats v-if="windowWidth >= 768" :total="totalCount" :done="doneCount" :undone="undoneCount" />
          <div v-else class="md:hidden text-sm text-center text-gray-600 dark:text-gray-400">
            {{ undoneCount }} تسک باقی‌مانده
          </div>

          <div class="max-w-full sm:max-w-xl mx-auto">
            <TaskForm :project-id="selectedProjectId" :is-edit-mode="isEditMode" :initial-data="selectedTask"
              @submit="handleTaskSubmit" @toast="showToast" @cancel="resetForm" />
          </div>

          <template v-if="windowWidth >= 768">
            <FiltersBar :selected-status="statusFilter" :selected-priority="priorityFilter"
              @update-status="statusFilter = $event" @update-priority="priorityFilter = $event" />
          </template>
          <FilterBarMobile v-else v-model:status="statusFilter" v-model:priority="priorityFilter" />

          <TaskList :tasks="filteredTasks" :selected-project-id="taskStore.selectedProjectId"
            :projects="taskStore.projects" @toggle-complete="toggleComplete" @delete-task="deleteTask"
            @reorder="reorderTasks" @edit="startEditTask" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, provide } from 'vue'
import { useTaskStore } from './store/tasks'
import ProjectSidebar from './components/ProjectSidebar.vue'
import TaskForm from './components/TaskForm.vue'
import FiltersBar from './components/FiltersBar.vue'
import TaskStats from './components/TaskStats.vue'
import TaskList from './components/TaskList.vue'
import ProjectSidebarMobile from './components/ProjectSidebarMobile.vue'
import FilterBarMobile from './components/FilterBarMobile.vue'
import { getNextDate } from './utils/nlp/date'
import { isBeforeToday } from './utils/nlp/utils'
import jalaali from 'jalaali-js'

const taskStore = useTaskStore()
const selectedProjectId = computed(() => taskStore.selectedProjectId)

const windowWidth = ref(window.innerWidth)
const sidebarOpen = ref(false)
const isDark = ref(false)
const toastMessage = ref('')
const selectedTask = ref(null)
const isEditMode = ref(false)
const statusFilter = ref('all')
const priorityFilter = ref('')

onMounted(() => {
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
  })

  isDark.value = localStorage.getItem('theme') === 'dark'
  document.documentElement.classList.toggle('dark', isDark.value)

  if ('Notification' in window) {
    Notification.requestPermission()
  }
})

watch(isDark, val => {
  localStorage.setItem('theme', val ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', val)
})

const toggleDark = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const isToday = (persianDateStr) => {
  if (!persianDateStr) return false
  const today = new Date()
  const { jy, jm, jd } = jalaali.toJalaali(today)
  const pad = n => n.toString().padStart(2, '0')
  return persianDateStr === `${jy}/${pad(jm)}/${pad(jd)}`
}

const filteredTasks = computed(() => {
  return taskStore.tasks.filter(task => {
    const matchProject =
      taskStore.selectedProjectId === 0 ||
      (taskStore.selectedProjectId === -1 && isToday(task.date)) ||
      (taskStore.selectedProjectId === -2 && task.completed) ||
      (taskStore.selectedProjectId === -3 && task.date && !task.completed && isBeforeToday(task.date)) ||
      task.projectId === taskStore.selectedProjectId

    const matchStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'done' && task.completed) ||
      (statusFilter.value === 'undone' && !task.completed)

    const matchPriority =
      !priorityFilter.value || task.priority === priorityFilter.value

    return matchProject && matchStatus && matchPriority
  })
})

provide('filteredTasks', filteredTasks)
provide('startEditTask', (task) => startEditTask(task))
provide('selectedProjectId', computed(() => taskStore.selectedProjectId))

const totalCount = computed(() => filteredTasks.value.length)
const doneCount = computed(() => filteredTasks.value.filter(t => t.completed).length)
const undoneCount = computed(() => filteredTasks.value.filter(t => !t.completed).length)

const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => (toastMessage.value = ''), 2500)
}

const addProject = (name) => {
  taskStore.addProject(name)
}

const deleteProject = (id) => {
  taskStore.deleteProject(id)
  if (taskStore.selectedProjectId === id) taskStore.selectProject(0)
}

const toggleComplete = (id) => {
  const task = taskStore.tasks.find(t => t.id === id)
  if (!task) return
  task.completed = !task.completed
  taskStore.saveTasks()

  if (task.completed && task.repeat) {
    const nextDate = getNextDate(task.date, task.repeat)
    const alreadyExists = taskStore.tasks.some(t =>
      t.date === nextDate &&
      t.repeatInstanceOf === (task.repeatInstanceOf || task.id)
    )
    if (!alreadyExists && nextDate) {
      taskStore.addTask({
        id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
        title: task.title,
        time: task.time,
        date: nextDate,
        completed: false,
        repeat: task.repeat,
        priority: task.priority,
        projectId: task.projectId ?? 0,
        repeatInstanceOf: task.repeatInstanceOf || task.id
      })

      showToast(`🔁 تسک تکراری برای ${nextDate} ساخته شد`)
    }
  }
}
provide('toggleComplete', toggleComplete)

const deleteTask = (id) => {
  taskStore.deleteTask(id)
}

const reorderTasks = (newList) => {
  taskStore.reorderTasks(newList, taskStore.selectedProjectId)
}

const handleTaskSubmit = (task) => {
  const existing = taskStore.tasks.find(t => t.id === task.id)
  if (existing) {
    taskStore.updateTask(task)
    showToast('✏️ تسک با موفقیت ویرایش شد!')
  } else {
    taskStore.addTask({
      ...task,
      completed: false,
      projectId: task.projectId ?? 0
    })
    showToast('✅ تسک با موفقیت افزوده شد!')
  }
  selectedTask.value = null
  isEditMode.value = false
}

const startEditTask = (task) => {
  selectedTask.value = { ...task }
  isEditMode.value = true
}

const handleTaskMove = ({ taskId, projectId }) => {
  const task = taskStore.tasks.find(t => t.id === taskId)
  if (task) {
    task.projectId = projectId
    taskStore.saveTasks()
  }
}

const resetForm = () => {
  selectedTask.value = null
  isEditMode.value = false
}

const activeProjectName = computed(() => {
  if (taskStore.selectedProjectId === 0) return 'همه تسک‌ها'
  if (taskStore.selectedProjectId === -1) return 'امروز'
  if (taskStore.selectedProjectId === -2) return 'انجام‌شده‌ها'
  if (taskStore.selectedProjectId === -3) return 'از دست رفته‌ها'
  const p = taskStore.projects.find(p => p.id === taskStore.selectedProjectId)
  return p?.name || 'بدون‌نام'
})
</script>



<style>
@font-face {
  font-family: 'Vazirmatn';
  src: url('/fonts/Vazirmatn-Light.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

body {
  font-family: 'Vazirmatn', sans-serif;
}

:root.dark .vpd-content {
  background-color: #1f2937 !important;
  color: white !important;
}

:root.dark .vpd-title,
:root.dark .vpd-header,
:root.dark .vpd-actions {
  background-color: #111827 !important;
  color: white !important;
}

:root.dark .vpd-day.vpd-today {
  background-color: #2563eb !important;
  color: white !important;
}

:root.dark input.vpd-input {
  background-color: #374151 !important;
  color: #fff !important;
  border: 1px solid #4b5563 !important;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-enter-to {
  transform: translateX(0);
}

.slide-leave-from {
  transform: translateX(0);
}

.slide-leave-to {
  transform: translateX(100%);
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease-in-out;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
