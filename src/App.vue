<template>
  <div v-if="toastMessage"
    class="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-600 text-white rounded-xl shadow z-50 transition-opacity duration-300">
    {{ toastMessage }}
  </div>

  <div class="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">

    <button @click="toggleDark"
      class="fixed top-4 left-4 z-50 p-2 px-3 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700 rounded-full shadow hover:scale-105 transition">
      {{ isDark ? '☀️ روشن' : '🌙 تاریک' }}
    </button>

    <div class="flex flex-col md:flex-row gap-6 p-6 max-w-7xl mx-auto">
      <ProjectSidebar
        :projects="projects"
        :selected-id="selectedProjectId"
        @select-project="selectProject"
        @add-project="addProject"
        @delete-project="deleteProject"
        @move-task-to-project="handleTaskMove"
      />

      <div class="flex-1 space-y-6 bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl shadow-md">
        <h1 class="text-3xl font-bold text-center text-gray-800 dark:text-white tracking-tight">
          برنامه‌ریز روزانه 📝
        </h1>

        <TaskStats :total="totalCount" :done="doneCount" :undone="undoneCount" />

        <div class="flex flex-col lg:flex-row gap-6 items-start">
          <NLPInput :project-id="selectedProjectId" @submit="handleParsedText" @toast="showToast" class="flex-1 lg:max-w-sm" />
          <TaskForm :project-id="selectedProjectId" @submit="addTask" @toast="showToast" class="flex-1" />
        </div>

        <FiltersBar
          :selected-status="statusFilter"
          :selected-priority="priorityFilter"
          @update-status="statusFilter = $event"
          @update-priority="priorityFilter = $event"
        />

        <TaskList
          :tasks="filteredTasks"
          :selected-project-id="selectedProjectId"
          :projects="projects"
          @toggle-complete="toggleComplete"
          @delete-task="deleteTask"
          @reorder="reorderTasks"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import ProjectSidebar from './components/ProjectSidebar.vue'
import TaskForm from './components/TaskForm.vue'
import NLPInput from './components/NLPInput.vue'
import FiltersBar from './components/FiltersBar.vue'
import TaskStats from './components/TaskStats.vue'
import TaskList from './components/TaskList.vue'
import { parsePersianTask } from './utils/nlp'
import jalaali from 'jalaali-js'
import { isBeforeToday } from './utils/nlp/utils'

const loadFromStorage = (key, fallback) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch (e) {
    return fallback
  }
}

const saveToStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

const projects = ref(loadFromStorage('todo-projects', [
  { id: 2, name: 'شخصی' },
]))

const selectedProjectId = ref(0)

const tasks = reactive(loadFromStorage('todo-tasks', []))

onMounted(() => {
  const storedProjects = loadFromStorage('todo-projects', null)
  if (storedProjects) projects.value = storedProjects

  const storedTasks = loadFromStorage('todo-tasks', null)
  if (storedTasks) {
    tasks.splice(0, tasks.length, ...storedTasks)
  }

  const savedTheme = localStorage.getItem('theme')
  isDark.value = savedTheme === 'dark'
  document.documentElement.classList.toggle('dark', isDark.value)
})

const statusFilter = ref('all')
const priorityFilter = ref('')

const isToday = (persianDateStr) => {
  if (!persianDateStr) return false
  const today = new Date()
  const { jy, jm, jd } = jalaali.toJalaali(today)
  const pad = n => n.toString().padStart(2, '0')
  const todayStr = `${jy}/${pad(jm)}/${pad(jd)}`
  return persianDateStr === todayStr
}
const filteredTasks = computed(() => {
  return tasks.filter(task => {
    let matchProject = false;

    if (selectedProjectId.value === -1) {
      matchProject = isToday(task.date);
    } else if (selectedProjectId.value === -2) {
      matchProject = task.completed;
    } else if (selectedProjectId.value === -3) {
      matchProject = task.date && !task.completed && !isToday(task.date) && isBeforeToday(task.date);
    } else if (selectedProjectId.value === 0) {
      matchProject = true;
    } else {
      matchProject = task.projectId === selectedProjectId.value;
    }

    const matchStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'done' && task.completed) ||
      (statusFilter.value === 'undone' && !task.completed);

    const matchPriority =
      !priorityFilter.value || task.priority === priorityFilter.value;

    return matchProject && matchStatus && matchPriority;
  });
});


const totalCount = computed(() => filteredTasks.value.length)
const doneCount = computed(() => filteredTasks.value.filter(t => t.completed).length)
const undoneCount = computed(() => filteredTasks.value.filter(t => !t.completed).length)

const addTask = (newTask) => {
  tasks.push({
    id: Date.now(),
    ...newTask,
    completed: false,
    projectId: selectedProjectId.value >= 1 ? selectedProjectId.value : 0,
  })
}

const toggleComplete = (id) => {
  const task = tasks.find(t => t.id === id)
  if (task) task.completed = !task.completed
}

const deleteTask = (id) => {
  const index = tasks.findIndex(t => t.id === id)
  if (index !== -1) tasks.splice(index, 1)
}

const selectProject = (id) => {
  selectedProjectId.value = id
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
  if (selectedProjectId.value === id) {
    selectedProjectId.value = 0
  }
}

const reorderTasks = (newList) => {
  const otherTasks = tasks.filter(t => {
    const pid = selectedProjectId.value
    return !(pid === 0 || t.projectId === pid)
  })
  tasks.splice(0, tasks.length, ...otherTasks, ...newList)
}

const handleParsedText = async ({ text }) => {
  const parsedTasks = await parsePersianTask(text)
  parsedTasks.forEach(task => {
    tasks.push({
      id: Date.now() + Math.random(),
      ...task,
      completed: false,
      projectId: selectedProjectId.value >= 1 ? selectedProjectId.value : 0
    })
  })
}

const handleTaskMove = ({ taskId, projectId }) => {
  const task = tasks.find(t => t.id === taskId)
  if (task) {
    task.projectId = projectId
  }
}

const isDark = ref(false)
const toggleDark = () => {
  isDark.value = !isDark.value
}
watch(isDark, (val) => {
  localStorage.setItem('theme', val ? 'dark' : 'light')
  document.documentElement.classList.toggle('dark', val)
})

watch(projects, (val) => saveToStorage('todo-projects', val), { deep: true })
watch(tasks, (val) => saveToStorage('todo-tasks', val), { deep: true })

const toastMessage = ref('')
const showToast = (message) => {
  toastMessage.value = message
  setTimeout(() => {
    toastMessage.value = ''
  }, 2500)
}
</script>

<style>
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
</style>
