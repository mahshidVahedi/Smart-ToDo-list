<template>
  <div class="container max-w-lg mx-auto px-4 space-y-4">
    <draggable v-model="localTasksInternal" item-key="id" handle=".drag-handle" @end="onReorder"
      class="space-y-3" ghost-class="drag-ghost" chosen-class="drag-chosen" animation="180">
      <template #item="{ element }">
        <div class="flex items-start gap-2 group relative">
          <span
            class="drag-handle cursor-grab text-gray-400 dark:text-gray-500 text-lg transition-opacity opacity-60 group-hover:opacity-100"
            title="بکش و رها کن">
            ☰
          </span>
          <TaskItem
            :task="element"
            :projects="projects"
            @toggle-complete="toggleComplete(element.id)"
            @delete-task="deleteTask(element.id)"
            @edit="startEditTask(element)"
          />
        </div>
      </template>
    </draggable>

    <div v-if="!localTasks.length"
      class="flex flex-col items-center justify-center text-center py-12 text-gray-500 dark:text-gray-400 border border-dashed rounded-xl border-gray-300 dark:border-gray-600">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mb-4 text-blue-400 dark:text-blue-300" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 12h6m-6 4h6m-2 4H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v11a2 2 0 01-2 2h-5z" />
      </svg>
      <p class="text-lg font-semibold">تسکی در این پروژه وجود ندارد</p>
      <p class="text-sm mt-1">اولین تسک رو اضافه کن و کار رو شروع کن 🚀</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, inject } from 'vue'
import { useTaskStore } from '../store/tasks'
import TaskItem from './TaskItem.vue'
import draggable from 'vuedraggable'

const taskStore = useTaskStore()

const filteredTasks = inject('filteredTasks') || computed(() => taskStore.tasks)

const projects = computed(() => taskStore.projects)

const localTasks = computed(() => {
  return Array.isArray(filteredTasks.value) ? filteredTasks.value : []
})

const localTasksInternal = ref([])

watch(
  () => localTasks.value,
  (newTasks) => {
    localTasksInternal.value = [...newTasks]
  },
  { immediate: true }
)

const toggleComplete = (id) => {
  taskStore.toggleComplete(id)
}

const deleteTask = (id) => {
  taskStore.deleteTask(id)
}

const startEditTask = inject('startEditTask') 
const onReorder = () => {
  taskStore.reorderTasks([...localTasksInternal.value])
}
</script>

<style scoped>
.drag-ghost {
  opacity: 0.4;
}

.drag-chosen {
  background-color: #e5e7eb;
}

.dark .drag-chosen {
  background-color: #374151;
}
</style>
