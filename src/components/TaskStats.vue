<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow">
    <div class="space-y-1 p-2 bg-white/30 dark:bg-gray-700/40 rounded-xl">
      <p class="text-sm text-gray-500 dark:text-gray-400">کل کارها</p>
      <p class="text-xl font-bold text-gray-800 dark:text-white">{{ total }}</p>
    </div>
    <div class="space-y-1 p-2 bg-white/30 dark:bg-gray-700/40 rounded-xl">
      <p class="text-sm text-gray-500 dark:text-gray-400">انجام‌شده</p>
      <p class="text-xl font-bold text-green-600 dark:text-green-400">{{ done }}</p>
    </div>
    <div class="space-y-1 p-2 bg-white/30 dark:bg-gray-700/40 rounded-xl">
      <p class="text-sm text-gray-500 dark:text-gray-400">باز</p>
      <p class="text-xl font-bold text-red-600 dark:text-red-400">{{ undone }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  total: Number,
  done: Number,
  undone: Number,
})
</script>

  