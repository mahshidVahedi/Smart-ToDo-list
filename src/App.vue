<template>
  <div class="relative min-h-screen overflow-hidden text-gray-900 dark:text-gray-100">

    <div class="md:hidden fixed inset-0 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-800 z-[-1]"></div>

    <img
      src="/images/bg-light.jpg"
      alt="Light Background"
      class="hidden md:block w-full h-full object-cover blur-sm opacity-60 dark:hidden absolute inset-0 -z-10"
    />
    <img
      src="/images/bg-dark.jpg"
      alt="Dark Background"
      class="hidden md:block w-full h-full object-cover blur-sm opacity-50 dark:block absolute inset-0 -z-10"
    />
    <div class="hidden md:block absolute inset-0 bg-white/30 dark:bg-black/40 backdrop-blur-[2px] -z-10"></div>

    <ProjectSidebarMobile
      v-if="sidebarOpen && windowWidth < 768"
      :projects="projects"
      :selected-id="selectedProjectId"
      :is-dark="isDark"
      @select-project="selectProject"
      @add-project="addProject"
      @delete-project="deleteProject"
      @toggle-theme="toggleDark"
      @close="sidebarOpen = false"
    />

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
      <div class="flex flex-col md:flex-row gap-2 sm:gap-4 md:gap-6 p-2 sm:p-4 md:p-6 w-full max-w-full md:max-w-7xl mx-auto">

        <ProjectSidebar
          v-if="windowWidth >= 768"
          :projects="projects"
          :selected-id="selectedProjectId"
          :is-dark="isDark"
          @select-project="selectProject"
          @add-project="addProject"
          @delete-project="deleteProject"
          @move-task-to-project="handleTaskMove"
          @toggle-theme="toggleDark"
          @close="sidebarOpen = false"
        />

        <div class="flex-1 space-y-3 sm:space-y-4 md:space-y-6 bg-gray-50 dark:bg-gray-950 md:bg-white/70 md:dark:bg-gray-900/70 md:backdrop-blur-md p-3 sm:p-4 md:p-6 rounded-2xl shadow-md">
          <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-center text-gray-800 dark:text-white tracking-tight">
            {{ activeProjectName }}
          </h1>

          <TaskStats
            v-if="windowWidth >= 768"
            :total="totalCount"
            :done="doneCount"
            :undone="undoneCount"
          />
          <div v-else class="md:hidden text-sm text-center text-gray-600 dark:text-gray-400">
            {{ undoneCount }} تسک باقی‌مانده
          </div>

          <div class="max-w-full sm:max-w-xl mx-auto">
            <TaskForm
              :project-id="selectedProjectId"
              :is-edit-mode="isEditMode"
              :initial-data="selectedTask"
              @submit="handleTaskSubmit"
              @toast="showToast"
              @cancel="resetForm"
            />
          </div>

          <template v-if="windowWidth >= 768">
            <FiltersBar
              :selected-status="statusFilter"
              :selected-priority="priorityFilter"
              @update-status="statusFilter = $event"
              @update-priority="priorityFilter = $event"
            />
          </template>
          <FilterBarMobile
            v-else
            v-model:status="statusFilter"
            v-model:priority="priorityFilter"
          />

          <TaskList
            :tasks="filteredTasks"
            :selected-project-id="selectedProjectId"
            :projects="projects"
            @toggle-complete="toggleComplete"
            @delete-task="deleteTask"
            @reorder="reorderTasks"
            @edit="startEditTask"
          />
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import ProjectSidebar from './components/ProjectSidebar.vue'
import TaskForm from './components/TaskForm.vue'
import FiltersBar from './components/FiltersBar.vue'
import TaskStats from './components/TaskStats.vue'
import TaskList from './components/TaskList.vue'
import ProjectSidebarMobile from './components/ProjectSidebarMobile.vue'
import FilterBarMobile from './components/FilterBarMobile.vue'
import { parsePersianTask } from './utils/nlp'
import { getNextDate } from './utils/nlp/date'
import { isBeforeToday } from './utils/nlp/utils'
import jalaali from 'jalaali-js'
const windowWidth = ref(window.innerWidth)

onMounted(() => {
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
  })
})

const sidebarOpen = ref(false)
const isDark = ref(false)
const toastMessage = ref('')
const selectedTask = ref(null)
const isEditMode = ref(false)
const selectedProjectId = ref(0)
const statusFilter = ref('all')
const priorityFilter = ref('')
const projects = ref(loadFromStorage('todo-projects', [{ id: 2, name: 'شخصی' }]))
const tasks = reactive(loadFromStorage('todo-tasks', []))

function loadFromStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

onMounted(() => {
  isDark.value = localStorage.getItem('theme') === 'dark'
  document.documentElement.classList.toggle('dark', isDark.value)
})


watch(isDark, val => {
  localStorage.setItem('theme', val ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', val)
})

watch(projects, val => saveToStorage('todo-projects', val), { deep: true })
watch(tasks, val => saveToStorage('todo-tasks', val), { deep: true })

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
  return tasks.filter(task => {
    const matchProject =
      selectedProjectId.value === 0 ||
      (selectedProjectId.value === -1 && isToday(task.date)) ||
      (selectedProjectId.value === -2 && task.completed) ||
      (selectedProjectId.value === -3 && task.date && !task.completed && isBeforeToday(task.date)) ||
      task.projectId === selectedProjectId.value

    const matchStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'done' && task.completed) ||
      (statusFilter.value === 'undone' && !task.completed)

    const matchPriority =
      !priorityFilter.value || task.priority === priorityFilter.value

    return matchProject && matchStatus && matchPriority
  })
})

const totalCount = computed(() => filteredTasks.value.length)
const doneCount = computed(() => filteredTasks.value.filter(t => t.completed).length)
const undoneCount = computed(() => filteredTasks.value.filter(t => !t.completed).length)

const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => (toastMessage.value = ''), 2500)
}

const selectProject = (id) => {
  selectedProjectId.value = id
  sidebarOpen.value = false
}

const addProject = (name) => {
  projects.value.push({ id: Date.now(), name })
}

const deleteProject = (id) => {
  projects.value = projects.value.filter(p => p.id !== id)
  const relatedTasks = tasks.filter(t => t.projectId === id)
  relatedTasks.forEach(task => {
    const i = tasks.findIndex(t => t.id === task.id)
    if (i !== -1) tasks.splice(i, 1)
  })
  if (selectedProjectId.value === id) selectedProjectId.value = 0
}

const toggleComplete = (id) => {
  const task = tasks.find(t => t.id === id)
  if (!task) return
  task.completed = !task.completed

  if (task.completed && task.repeat) {
    const nextDate = getNextDate(task.date, task.repeat)
    const alreadyExists = tasks.some(t =>
      t.date === nextDate &&
      t.repeatInstanceOf === (task.repeatInstanceOf || task.id)
    )

    if (!alreadyExists && nextDate) {
      tasks.push({
        ...task,
        id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
        date: nextDate,
        completed: false,
        repeatInstanceOf: task.repeatInstanceOf || task.id
      })

      showToast(`🔁 تسک تکراری برای ${nextDate} ساخته شد`)
    }
  }
}

const deleteTask = (id) => {
  const index = tasks.findIndex(t => t.id === id)
  if (index !== -1) tasks.splice(index, 1)
}

const reorderTasks = (newList) => {
  const pid = selectedProjectId.value
  const otherTasks = tasks.filter(t => !(pid === 0 || t.projectId === pid))
  tasks.splice(0, tasks.length, ...otherTasks, ...newList)
}

const handleTaskSubmit = (task) => {
  const index = tasks.findIndex(t => t.id === task.id)
  if (index !== -1) tasks[index] = { ...tasks[index], ...task }
  else tasks.push({ ...task, completed: false, projectId: task.projectId ?? 0 })
  selectedTask.value = null
  isEditMode.value = false
}

const startEditTask = (task) => {
  selectedTask.value = { ...task }
  isEditMode.value = true
}

const handleTaskMove = ({ taskId, projectId }) => {
  const task = tasks.find(t => t.id === taskId)
  if (task) task.projectId = projectId
}

const resetForm = () => {
  selectedTask.value = null
  isEditMode.value = false
}
const activeProjectName = computed(() => {
  if (selectedProjectId.value === 0) return 'همه تسک‌ها'
  if (selectedProjectId.value === -1) return 'امروز'
  if (selectedProjectId.value === -2) return 'انجام‌شده‌ها'
  if (selectedProjectId.value === -3) return 'از دست رفته‌ها'
  const p = projects.value.find(p => p.id === selectedProjectId.value)
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
