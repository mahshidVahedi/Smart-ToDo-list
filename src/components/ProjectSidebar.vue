<template>
  <aside class="w-full md:w-64 bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
    <h2 class="text-lg font-bold text-gray-700 dark:text-gray-100 mb-4 flex items-center gap-2">
      <span>📁</span>
      <span>پروژه‌ها</span>
    </h2>

    <ul class="space-y-2">
      <li
        v-for="project in projects"
        :key="project.id"
        class="flex items-center justify-between px-3 py-2 rounded-xl transition cursor-pointer group"
        :class="[
          selectedId === project.id
            ? 'bg-blue-100 dark:bg-blue-600 text-blue-900 dark:text-white font-bold'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
          isDropTarget === project.id ? 'outline outline-2 outline-blue-400 bg-blue-50 dark:bg-blue-900/20' : ''
        ]"
        @dragover.prevent
        @dragenter="() => isDropTarget = project.id"
        @dragleave="() => isDropTarget = null"
        @drop="(event) => handleDrop(event, project.id)"
      >
        <span
          @click="$emit('select-project', project.id)"
          class="flex-1 truncate group-hover:underline"
        >
          {{ project.name }}
        </span>

        <button
          v-if="project.id !== 1"
          @click="$emit('delete-project', project.id)"
          class="text-red-500 hover:text-red-600 text-sm ml-2 transition"
          title="حذف پروژه"
        >
          🗑️
        </button>
      </li>
    </ul>

    <form @submit.prevent="addProject" class="mt-5 flex gap-2">
      <input
        v-model="newProject"
        type="text"
        placeholder="نام پروژه جدید"
        class="flex-1 px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition"
      >
        +
      </button>
    </form>
  </aside>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  projects: Array,
  selectedId: Number
})

const emit = defineEmits(['select-project', 'add-project', 'delete-project', 'move-task-to-project'])

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
</script>
