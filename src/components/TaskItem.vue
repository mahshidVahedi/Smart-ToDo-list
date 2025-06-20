<template>
  <div
    class="flex flex-col gap-2 w-full max-w-xl mx-auto p-3 rounded-lg bg-white dark:bg-gray-800 shadow hover:shadow-md transition border-s-4"
    :class="[priorityClass, task?.completed && 'opacity-50 line-through']"
  >
    <div class="flex items-start justify-between gap-3">
      <div class="flex items-start gap-2">
        <input
          type="checkbox"
          class="w-5 h-5 mt-1 accent-green-500"
          :checked="task?.completed"
          @change="$emit('toggle-complete', task?.id)"
          @dragstart="onDragStart"
        />
        <span class="text-base font-semibold text-gray-800 dark:text-white break-words">
          {{ task?.title || 'بدون عنوان' }}
        </span>
      </div>

      <div class="flex gap-2 shrink-0">
        <button
          @click="$emit('edit', task)"
          title="ویرایش"
          class="text-gray-500 hover:text-blue-500 text-sm"
        >
          ✏️
        </button>
        <button
          @click="$emit('delete-task', task?.id)"
          title="حذف"
          class="text-red-500 hover:text-red-600 text-sm"
        >
          🗑️
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
      <span v-if="task?.timeRange" class="tag">🕒 {{ task.timeRange.from }} - {{ task.timeRange.to }}</span>
      <span v-else-if="task?.time" class="tag">🕒 {{ task.time }}</span>
      <span v-else class="tag">🕒 بدون زمان</span>

      <span v-if="task?.date" class="tag">📅 {{ task.date }}</span>
      <span v-else class="tag">📅 بدون تاریخ</span>

      <!-- <span v-if="task?.priority" class="tag font-bold" :class="colorClass">
        {{ priorityLabelMap[task.priority] || task.priority }}
      </span>
      <span v-else class="tag">🏷️ بدون اولویت</span> -->

      <span v-if="task?.repeat" class="tag bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
        🔁 {{ repeatLabel }}
      </span>

      <span class="tag">📁 {{ projectName }}</span>
    </div>
  </div>
</template>


<style scoped>
.tag {
  @apply px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300;
}
</style>


<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: Object,
  projects: Array
})

const priorityLabelMap = {
  low: 'کم',
  medium: 'متوسط',
  important: 'مهم',
  high: 'فوری',
  'کم': 'کم',
  'متوسط': 'متوسط',
  'مهم': 'مهم',
  'فوری': 'فوری',
}

const priorityColor = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  important: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const priorityClass = computed(() => {
  const p = props.task?.priority
  const map = {
    'فوری': 'border-r-red-500 bg-red-50 dark:bg-red-900/10',
    'مهم': 'border-r-orange-500 bg-orange-50 dark:bg-orange-900/10',
    'متوسط': 'border-r-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
    'کم': 'border-r-green-500 bg-green-50 dark:bg-green-900/10',
    'high': 'border-r-red-500 bg-red-50 dark:bg-red-900/10',
    'important': 'border-r-orange-500 bg-orange-50 dark:bg-orange-900/10',
    'medium': 'border-r-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
    'low': 'border-r-green-500 bg-green-50 dark:bg-green-900/10',
  }
  return map[p] || 'border-r-gray-300 bg-white dark:bg-gray-800'
})

const colorClass = computed(() => {
  return priorityColor[props.task?.priority] || 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
})

const repeatLabel = computed(() => {
  if (typeof props.task?.repeat === 'string') {
    if (props.task.repeat === 'weekly') return 'هر هفته'
    if (props.task.repeat === 'daily') return 'هر روز'
    return props.task.repeat
  }
  return ''
})

const projectName = computed(() => {
  const found = props.projects?.find(p => p.id === props.task?.projectId)
  return found ? found.name : 'نامشخص'
})

const onDragStart = (e) => {
  e.dataTransfer.setData('text/plain', props.task?.id)
}
</script>
