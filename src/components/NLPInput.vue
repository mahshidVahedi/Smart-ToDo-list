<template>
    <form @submit.prevent="handleSubmit" class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow flex gap-2 items-center">
      <input
        v-model="text"
        type="text"
        class="flex-1 px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="مثلاً: جلسه با تیم فردا ساعت ۹"
        required
      />
      <button
        type="submit"
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        اضافه کن
      </button>
    </form>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const emit = defineEmits(['parse-text'])
  
  const text = ref('')
  
  const handleSubmit = () => {
    emit('parse-text', text.value.trim())
    text.value = ''
  }
  </script>
  