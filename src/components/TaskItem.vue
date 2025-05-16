<template>
  <div
    class="flex items-start justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-md transition-all duration-200"
    :class="{ 'opacity-50 line-through': task.completed }"
  >
    <div class="flex flex-col">
      <label class="inline-flex items-center mb-2 cursor-pointer">
        <input
          type="checkbox"
          class="w-5 h-5 accent-green-500"
          :checked="task.completed"
          @change="$emit('toggle-complete', task.id)"
        />
        <span class="mr-3 text-base font-medium text-gray-800 dark:text-gray-200">
          {{ task.title }}
        </span>
      </label>

      <div class="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-3">
        <span v-if="task.time">🕒 {{ task.time }}</span>
        <span v-if="task.date">📅 {{ task.date }}</span>
        <span
          v-if="task.priority"
          class="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs"
        >
          {{ task.priority }}
        </span>
      </div>
    </div>

    <button
      @click="$emit('delete-task', task.id)"
      class="text-red-500 hover:text-red-700 text-xl"
      title="حذف تسک"
    >
      🗑️
    </button>
  </div>
</template>

<script setup>
defineProps({
  task: {
    type: Object,
    required: true,
  },
})

defineEmits(['toggle-complete', 'delete-task'])
</script>
