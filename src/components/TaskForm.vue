<template>
    <form @submit.prevent="handleSubmit" class="bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-4">
      <div>
        <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">عنوان</label>
        <input
          v-model="form.title"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="مثلاً: جلسه با تیم توسعه"
          required
        />
      </div>
  
      <div class="flex gap-4">
        <div class="flex-1">
          <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">تاریخ</label>
          <input
            v-model="form.date"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>
  
        <div class="flex-1">
          <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">ساعت</label>
          <input
            v-model="form.time"
            type="time"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>
      </div>
  
      <div>
        <label class="block text-sm text-gray-600 dark:text-gray-300 mb-1">اولویت</label>
        <select
          v-model="form.priority"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
        >
          <option value="">بدون اولویت</option>
          <option value="کم">کم</option>
          <option value="متوسط">متوسط</option>
          <option value="مهم">مهم</option>
          <option value="فوری">فوری</option>
        </select>
      </div>
  
      <div class="flex justify-between">
        <button
          type="submit"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {{ isEditMode ? 'ویرایش تسک' : 'افزودن تسک' }}
        </button>
  
        <button
          v-if="isEditMode"
          type="button"
          class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          @click="$emit('cancel')"
        >
          انصراف
        </button>
      </div>
    </form>
  </template>
  
  <script setup>
  import { reactive, toRefs, watch, onMounted } from 'vue'
  
  const props = defineProps({
    initialData: Object,
    isEditMode: Boolean
  })
  
  const emit = defineEmits(['submit', 'cancel'])
  
  const form = reactive({
    title: '',
    date: '',
    time: '',
    priority: '',
  })
  
  watch(
    () => props.initialData,
    (newVal) => {
      if (newVal && props.isEditMode) {
        form.title = newVal.title || ''
        form.date = newVal.date || ''
        form.time = newVal.time || ''
        form.priority = newVal.priority || ''
      }
    },
    { immediate: true }
  )
  
  const handleSubmit = () => {
    emit('submit', { ...form })
    form.title = ''
    form.date = ''
    form.time = ''
    form.priority = ''
  }
  </script>
  