<template>
    <div class="flex flex-wrap items-center justify-center gap-3 text-sm text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-800/60 px-3 py-2 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <label class="flex items-center gap-2">
        وضعیت:
        <select
          v-model="status"
          class="px-3 py-1 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">همه</option>
          <option value="done">انجام‌شده</option>
          <option value="undone">انجام‌نشده</option>
        </select>
      </label>
  
      <label class="flex items-center gap-2">
        اولویت:
        <select
          v-model="priority"
          class="px-3 py-1 rounded-lg border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">همه</option>
          <option value="low">کم</option>
          <option value="medium">متوسط</option>
          <option value="important">مهم</option>
          <option value="high">فوری</option>

        </select>
      </label>
    </div>
  </template>
  
  <script setup>
  const props = defineProps({
    status: String,
    priority: String,
  })
  const emit = defineEmits(["update:status", "update:priority"])
  const status = defineModel("status")
  const priority = defineModel("priority")
  </script>
  