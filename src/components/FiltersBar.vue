<template>
    <div class="flex flex-wrap items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
      <!-- فیلتر وضعیت -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-300">وضعیت:</span>
        <button
          v-for="status in statusOptions"
          :key="status.value"
          @click="$emit('update-status', status.value)"
          :class="[
            'px-3 py-1 rounded text-sm transition',
            selectedStatus === status.value
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          {{ status.label }}
        </button>
      </div>
  
      <!-- فیلتر اولویت -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-300">اولویت:</span>
        <button
          v-for="priority in priorityOptions"
          :key="priority"
          @click="$emit('update-priority', priority)"
          :class="[
            'px-3 py-1 rounded text-sm transition',
            selectedPriority === priority
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
          ]"
        >
          {{ priority || 'همه' }}
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
  
  const priorityOptions = ['', 'کم', 'متوسط', 'مهم', 'فوری']
  </script>
  