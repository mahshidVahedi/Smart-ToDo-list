<template>
  <div class="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">

    <!-- فیلتر وضعیت -->
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm font-medium text-gray-600 dark:text-gray-300">وضعیت:</span>
      <button
        v-for="status in statusOptions"
        :key="status.value"
        @click="$emit('update-status', status.value)"
        :class="[
          'px-3 py-1 rounded-full text-sm transition font-semibold',
          selectedStatus === status.value
            ? 'bg-blue-600 text-white shadow'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
        ]"
      >
        {{ status.label }}
      </button>
    </div>

    <!-- فیلتر اولویت -->
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm font-medium text-gray-600 dark:text-gray-300">اولویت:</span>
      <button
        v-for="priority in priorityOptions"
        :key="priority.value"
        @click="$emit('update-priority', priority.value)"
        :class="[
          'px-3 py-1 rounded-full text-sm transition font-semibold',
          isPrioritySelected(priority.value)
            ? priorityColor(priority.value) + ' text-white shadow'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
        ]"
      >
        {{ priority.label }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  selectedStatus: String,
  selectedPriority: String,
})

defineEmits(['update-status', 'update-priority'])

const statusOptions = [
  { label: 'همه', value: 'all' },
  { label: 'انجام‌شده', value: 'done' },
  { label: 'انجام‌نشده', value: 'undone' },
]

const priorityOptions = [
  { value: '', label: 'همه' },
  { value: 'low', label: 'کم' },
  { value: 'medium', label: 'متوسط' },
  { value: 'important', label: 'مهم' },
  { value: 'high', label: 'فوری' },
]

const isPrioritySelected = (value) => {
  return props.selectedPriority === value
}

const priorityColor = (priority) => {
  const map = {
    low: 'bg-green-500',
    medium: 'bg-yellow-500',
    important: 'bg-orange-500',
    high: 'bg-red-500',
  }
  return map[priority] || 'bg-blue-500'
}
</script>
