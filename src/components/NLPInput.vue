<script setup>
import { ref } from 'vue'

const props = defineProps({
  projectId: Number
})
const emit = defineEmits(['submit', 'toast'])

const input = ref('')
const errorMessage = ref('')

const handleSubmit = () => {
  const trimmed = input.value.trim()
  if (!trimmed) {
    errorMessage.value = 'لطفاً یک جمله وارد کنید'
    return
  }

  errorMessage.value = '' // clear old errors

  emit('submit', {
    text: trimmed,
    projectId: props.projectId
  })

  emit('toast', '✅ تسک با موفقیت افزوده شد!')
  input.value = ''
}
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow space-y-4 border border-gray-200 dark:border-gray-700 max-w-lg mx-auto"
  >
    <label class="block text-sm font-semibold text-gray-700 dark:text-white">
      ساخت تسک از روی جمله فارسی 🧠
    </label>

    <textarea
      v-model="input"
      placeholder="مثلاً: جلسه مهم هر دوشنبه عصر ساعت ۴ تا ۶ در ۲۵ تیر"
      class="textarea-style"
    ></textarea>

    <p v-if="errorMessage" class="text-red-500 text-sm">{{ errorMessage }}</p>

    <div class="flex justify-end">
      <button
        type="submit"
        class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition"
      >
        ساخت تسک از متن ✨
      </button>
    </div>
  </form>
</template>

<style scoped>
.textarea-style {
  @apply w-full min-h-[100px] resize-y p-3 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500;
}
</style>
