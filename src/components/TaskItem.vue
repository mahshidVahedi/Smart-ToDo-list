<template>
  <div
    class="flex items-center justify-between p-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border-r-8 min-h-[120px] w-full max-w-xl mx-auto"
    :class="[priorityClass, task.completed && 'opacity-50 line-through']">
    <div class="flex flex-col gap-2 w-full">
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-3">
          <input type="checkbox" class="w-5 h-5 accent-green-500" :checked="task.completed"
            @change="$emit('toggle-complete', task.id)" @dragstart="onDragStart" />
          <span class="text-base font-semibold text-gray-800 dark:text-white">
            {{ task.title }}
          </span>
        </div>
        <button @click="$emit('delete-task', task.id)" class="text-red-500 hover:text-red-600 text-xl transition"
          title="حذف تسک">
          🗑️
        </button>
      </div>

      <div class="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-300 min-h-[28px]">
        <span v-if="task.timeRange">🕒 {{ task.timeRange.from }} - {{ task.timeRange.to }}</span>
        <span v-else-if="task.time">🕒 {{ task.time }}</span>
        <span v-if="task.date">📅 {{ task.date }}</span>

        <span v-if="task.priority" class="text-xs font-bold rounded-full px-2 py-0.5" :class="colorClass">
          {{ priorityLabelMap[task.priority] || task.priority }}
        </span>

        <span v-if="task.repeat"
          class="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-full font-medium">
          {{ repeatLabel }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
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
  return map[props.task.priority] || 'border-r-gray-300 bg-white dark:bg-gray-800'
})

const colorClass = computed(() => {
  return priorityColor[props.task.priority] || 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
})

const repeatLabel = computed(() => {
  if (typeof props.task.repeat === 'string') {
    if (props.task.repeat === 'weekly') return 'هر هفته'
    if (props.task.repeat === 'daily') return 'هر روز'
    return props.task.repeat
  }
  return ''
})
const onDragStart = (e) => {
  e.dataTransfer.setData('text/plain', task.id)
}

</script>
