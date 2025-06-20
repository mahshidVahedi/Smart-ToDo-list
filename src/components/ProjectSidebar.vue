<template>
  <aside
    class="w-64 max-w-full h-full md:h-auto md:static fixed top-0 right-0 z-40 md:z-0 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 p-4 rounded-l-2xl md:rounded-2xl shadow-xl border dark:border-gray-700 transition-transform duration-300"
    :class="{
      'translate-x-0': true,
      'md:translate-x-0': true
    }">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2 text-xl font-bold text-gray-700 dark:text-white">
        <span>📋</span>
        <span>برنامه‌ریز من</span>
      </div>
      <button
        class="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-white transition-transform duration-300 rotate-in"
        @click="$emit('close')" title="بستن">
        ✖
      </button>
    </div>
    <!-- فقط برای موبایل نمایش داده شود -->
    <div class="md:hidden mt-6 flex justify-center">
      <button @click="$emit('toggle-theme')"
        class="p-2 px-4 text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-full shadow hover:scale-105 transition">
        {{ isDark ? '☀️ روشن' : '🌙 تاریک' }}
      </button>
    </div>

    <ul class="space-y-1 overflow-y-auto">
      <li v-for="project in fullProjectList" :key="project.id"
        class="relative flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer group border border-transparent"
        :class="[
          selectedId === project.id
            ? 'bg-white/60 dark:bg-blue-700/30 font-bold text-blue-900 dark:text-white border-blue-400 dark:border-blue-500'
            : 'hover:bg-gray-100/60 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-300'
        ]" @dragover.prevent @dragenter="() => isDropTarget = project.id" @dragleave="() => isDropTarget = null"
        @drop="(event) => handleDrop(event, project.id)">
        <div v-if="project.color" :style="{ backgroundColor: project.color }"
          class="absolute right-0 top-0 bottom-0 w-1 rounded-r"></div>

        <div @click="$emit('select-project', project.id)" class="flex items-center gap-2 flex-1 truncate">
          <span>{{ project.icon || '📁' }}</span>
          <span class="truncate group-hover:underline">{{ project.name }}</span>
        </div>

        <button v-if="project.id > 0" @click="$emit('delete-project', project.id)"
          class="text-red-500 hover:text-red-600 text-sm ml-2 transition" title="حذف پروژه">
          🗑️
        </button>
      </li>
    </ul>

    <form @submit.prevent="addProject" class="mt-6 flex gap-2">
      <input v-model="newProject" type="text" placeholder="نام پروژه جدید"
        class="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <button type="submit"
        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition">
        +
      </button>
    </form>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  projects: Array,
  selectedId: Number,
  isDark: Boolean
})

const emit = defineEmits([
  'select-project',
  'add-project',
  'delete-project',
  'move-task-to-project',
  'close',
  'toggle-theme'
])

const newProject = ref('')
const isDropTarget = ref(null)

const addProject = () => {
  if (newProject.value.trim()) {
    emit('add-project', newProject.value.trim())
    newProject.value = ''
  }
}

const handleDrop = (event, projectId) => {
  const taskId = +event.dataTransfer.getData('text/plain')
  emit('move-task-to-project', { taskId, projectId })
  isDropTarget.value = null
}

const fixedProjects = [
  { id: 0, name: 'همه تسک‌ها', icon: '🗂️', color: '#6b7280' },
  { id: -1, name: 'امروز', icon: '📅', color: '#3b82f6' },
  { id: -2, name: 'انجام‌شده‌ها', icon: '✅', color: '#10b981' },
  { id: -3, name: 'از دست رفته‌ها', icon: '❌', color: '#ef4444' },
]

const fullProjectList = computed(() => [...fixedProjects, ...props.projects])

</script>

<style scoped>
.rotate-in {
  animation: rotateIn 0.3s ease-in-out;
}

@keyframes rotateIn {
  from {
    transform: rotate(-90deg);
    opacity: 0;
  }

  to {
    transform: rotate(0);
    opacity: 1;
  }
}
</style>
