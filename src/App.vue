<script setup>
import { reactive, ref, computed, watch, onMounted } from 'vue'
import ProjectSidebar from './components/ProjectSidebar.vue'
import TaskForm from './components/TaskForm.vue'
import NLPInput from './components/NLPInput.vue'
import FiltersBar from './components/FiltersBar.vue'
import TaskStats from './components/TaskStats.vue'
import TaskList from './components/TaskList.vue'
import { parsePersianTask } from './utils/nlp'

// --- ذخیره‌سازی و بازیابی محلی ---
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

// --- پروژه‌ها و تسک‌ها با localStorage ---
const projects = ref(loadFromStorage('todo-projects', [
  { id: 1, name: 'پیش‌فرض' },
  { id: 2, name: 'شخصی' },
]))
const selectedProjectId = ref(1)

const tasks = reactive(loadFromStorage('todo-tasks', [
  {
    id: 1,
    title: 'مطالعه Vue',
    completed: false,
    date: '۱۴۰۴/۰۲/۲۲',
    time: '۱۰:۰۰',
    priority: 'متوسط',
    projectId: 1,
  }
]))

// --- واکشی دوباره از localStorage در mount ---
onMounted(() => {
  const storedProjects = loadFromStorage('todo-projects', null)
  if (storedProjects) projects.value = storedProjects

  const storedTasks = loadFromStorage('todo-tasks', null)
  if (storedTasks) {
    tasks.splice(0, tasks.length, ...storedTasks)
  }
})

// --- فیلترها ---
const statusFilter = ref('all')
const priorityFilter = ref('')

// --- computed ها ---
const filteredTasks = computed(() =>
  tasks.filter(task => {
    const matchProject = task.projectId === selectedProjectId.value
    const matchStatus =
      statusFilter.value === 'all' ||
      (statusFilter.value === 'done' && task.completed) ||
      (statusFilter.value === 'undone' && !task.completed)
    const matchPriority =
      !priorityFilter.value || task.priority === priorityFilter.value
    return matchProject && matchStatus && matchPriority
  })
)
const totalCount = computed(() =>
  tasks.filter(t => t.projectId === selectedProjectId.value).length
)
const doneCount = computed(() =>
  tasks.filter(t => t.projectId === selectedProjectId.value && t.completed).length
)
const undoneCount = computed(() =>
  tasks.filter(t => t.projectId === selectedProjectId.value && !t.completed).length
)

// --- اکشن‌ها ---
const addTask = (newTask) => {
  tasks.push({
    id: Date.now(),
    ...newTask,
    completed: false,
    projectId: selectedProjectId.value,
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

const updateStatus = (val) => (statusFilter.value = val)
const updatePriority = (val) => (priorityFilter.value = val)

// --- ذخیره خودکار در localStorage ---
watch(projects, (val) => saveToStorage('todo-projects', val), { deep: true })
watch(tasks, (val) => saveToStorage('todo-tasks', val), { deep: true })
const deleteProject = (id) => {
  // حذف پروژه
  projects.value = projects.value.filter(p => p.id !== id)

  // حذف تسک‌های مرتبط
  const relatedTasks = tasks.filter(t => t.projectId === id)
  relatedTasks.forEach(task => {
    const i = tasks.findIndex(t => t.id === task.id)
    if (i !== -1) tasks.splice(i, 1)
  })

  // اگر پروژه فعال حذف شد، برگرد به اولی
  if (selectedProjectId.value === id) {
    selectedProjectId.value = projects.value[0]?.id || 1
  }
}
const reorderTasks = (newList) => {
  // مرتب‌سازی لیست فقط برای پروژه فعال
  const otherTasks = tasks.filter(t => t.projectId !== selectedProjectId.value)
  const reordered = [...otherTasks, ...newList]
  tasks.splice(0, tasks.length, ...reordered)
}
const handleParsedText = (text) => {
  const { title, date, time } = parsePersianTask(text)

  if (!title) return

  tasks.push({
    id: Date.now(),
    title,
    date,
    time,
    completed: false,
    projectId: selectedProjectId.value,
  })
}

</script>

<template>
  <div class="flex flex-col md:flex-row gap-6 p-6">
    <ProjectSidebar :projects="projects" :selected-id="selectedProjectId" @select-project="selectProject"
      @add-project="addProject" @delete-project="deleteProject" />


    <div class="flex-1 space-y-6 bg-gray-100 dark:bg-gray-900 p-4 rounded-xl">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-white text-center">
        برنامه‌ریز روزانه 📝
      </h1>

      <TaskStats :total="totalCount" :done="doneCount" :undone="undoneCount" />
      <NLPInput @parse-text="handleParsedText" />
      <TaskForm @submit="addTask" />
      <FiltersBar :selected-status="statusFilter" :selected-priority="priorityFilter" @update-status="updateStatus"
        @update-priority="updatePriority" />
      <TaskList :tasks="filteredTasks" @toggle-complete="toggleComplete" @delete-task="deleteTask"
        @reorder="reorderTasks" />
    </div>
  </div>
</template>
