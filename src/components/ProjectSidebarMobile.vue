<template>
  <transition name="mobile-sidebar">
    <div v-if="visible" class="fixed inset-0 z-50">
      <div
        class="absolute inset-0 bg-black/50"
        @click="closeSidebar"
      ></div>

      <aside
        class="absolute right-0 top-0 h-full w-72 max-w-[85%] bg-white dark:bg-gray-900 shadow-xl flex flex-col gap-4 p-5 z-50 transition-transform duration-300 ease-in-out"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-xl font-bold text-gray-800 dark:text-white">
            <span>📋</span>
            <span>پروژه‌ها</span>
          </div>
          <button
            @click="closeSidebar"
            class="text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
          >
            ✖
          </button>
        </div>

        <div class="mt-2">
          <button
            @click="$emit('toggle-theme')"
            class="w-full py-3 text-base font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl shadow hover:scale-[1.02] transition"
          >
            {{ isDark ? '☀️ روشن' : '🌙 تاریک' }}
          </button>
        </div>

        <ul class="flex-1 overflow-y-auto space-y-2 mt-2 pr-1">
          <li
            v-for="project in fullProjectList"
            :key="project.id"
            @click="selectProject(project.id)"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium cursor-pointer"
            :class="[
              selectedId === project.id
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-300'
            ]"
          >
            <span class="text-lg">{{ project.icon || '📁' }}</span>
            <span class="truncate">{{ project.name }}</span>
            <button
              v-if="project.id > 0"
              @click.stop="$emit('delete-project', project.id)"
              class="ml-auto text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm"
            >
              🗑️
            </button>
          </li>
        </ul>

        <form @submit.prevent="addProject" class="flex gap-2 pt-2">
          <input
            v-model="newProject"
            type="text"
            placeholder="نام جدید"
            class="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-base text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            class="px-5 py-3 bg-green-600 hover:bg-green-700 text-white text-base font-semibold rounded-xl transition"
          >
            +
          </button>
        </form>
      </aside>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  projects: Array,
  selectedId: Number,
  isDark: Boolean
})
const emit = defineEmits([
  'select-project',
  'add-project',
  'delete-project',
  'toggle-theme',
  'close'
])

const visible = ref(true)
const newProject = ref('')

const fixedProjects = [
  { id: 0, name: 'همه تسک‌ها', icon: '🗂️' },
  { id: -1, name: 'امروز', icon: '📅' },
  { id: -2, name: 'انجام‌شده‌ها', icon: '✅' },
  { id: -3, name: 'از دست رفته‌ها', icon: '❌' },
]
const fullProjectList = computed(() => [...fixedProjects, ...props.projects])

const addProject = () => {
  if (newProject.value.trim()) {
    emit('add-project', newProject.value.trim())
    newProject.value = ''
  }
}

const selectProject = (id) => {
  emit('select-project', id)
  emit('close')
}

const closeSidebar = () => {
  visible.value = false
  setTimeout(() => emit('close'), 300)
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.mobile-sidebar-enter-from {
  transform: translateX(100%);
  opacity: 0;
}
.mobile-sidebar-enter-to {
  transform: translateX(0);
  opacity: 1;
}
.mobile-sidebar-leave-from {
  transform: translateX(0);
  opacity: 1;
}
.mobile-sidebar-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
.mobile-sidebar-enter-active,
.mobile-sidebar-leave-active {
  transition: all 0.3s ease;
}
</style>
