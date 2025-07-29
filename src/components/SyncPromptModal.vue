<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
    <div class="bg-white dark:bg-gray-800 rounded-xl p-6 w-[90%] max-w-md shadow-xl">
      <h2 class="text-lg font-semibold text-gray-800 dark:text-white mb-4">سینک تسک‌ها با گوگل؟</h2>
      <p class="text-sm text-gray-600 dark:text-gray-300 mb-6">
        آیا می‌خواهید تمام تسک‌ها با Google Calendar و Google Tasks سینک شوند؟
      </p>
      <div class="flex justify-end gap-4">
        <button @click="reject"
                class="px-4 py-2 text-sm rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
          نه
        </button>
        <button @click="accept"
                class="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700">
          بله، سینک کن
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['show'])
const emit = defineEmits(['accept', 'reject'])

function accept() {
  localStorage.setItem('googleSyncChoice', 'yes')
  emit('accept')
}

function reject() {
  localStorage.setItem('googleSyncChoice', 'no')
  emit('reject')
}
</script>
