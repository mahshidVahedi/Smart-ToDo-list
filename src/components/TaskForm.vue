<template>
  <form @submit.prevent="handleSubmit"
    class="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md space-y-6 border border-gray-200 dark:border-gray-700 max-w-lg mx-auto">
    <div>
      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">عنوان</label>
      <input v-model="form.title" type="text" class="input-style" placeholder="مثلاً: جلسه با تیم توسعه" required />
    </div>
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="flex-1">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">تاریخ</label>
        <PersianDatePicker
          input-class="w-full px-4 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />

      </div>
      <div class="flex-1">
        <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">ساعت</label>
        <input v-model="form.time" type="time" class="input-style" />
      </div>
    </div>

    <div>
      <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">اولویت</label>
      <select v-model="form.priority" class="input-style">
        <option value="">بدون اولویت</option>
        <option value="low">کم</option>
        <option value="medium">متوسط</option>
        <option value="important">مهم</option>
        <option value="high">فوری</option>
      </select>

    </div>

    <div class="flex flex-col sm:flex-row justify-end items-center gap-3 pt-2">
      <button type="submit"
        class="px-6 py-2 text-sm font-semibold rounded-xl bg-green-600 text-white hover:bg-green-700 transition w-full sm:w-auto">
        {{ isEditMode ? 'ویرایش تسک' : 'افزودن تسک' }}
      </button>

      <button v-if="isEditMode" type="button"
        class="px-6 py-2 text-sm font-semibold rounded-xl bg-gray-500 text-white hover:bg-gray-600 transition w-full sm:w-auto"
        @click="$emit('cancel')">
        انصراف
      </button>
    </div>
  </form>
</template>

<script setup>
import { reactive, watch, defineAsyncComponent } from 'vue'
import Timepicker from 'vue3-timepicker'
import 'vue3-timepicker/dist/VueTimepicker.css'

const PersianDatePicker = defineAsyncComponent(() =>
  import('vue3-persian-datetime-picker')
)

const props = defineProps({
  initialData: Object,
  isEditMode: Boolean,
  projectId: Number

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
  emit('submit', {
    ...form,
    projectId: props.projectId
  })
  emit('toast', '✅ تسک با موفقیت افزوده شد!')

  form.title = ''
  form.date = ''
  form.time = ''
  form.priority = ''
}

</script>

<style scoped>
.input-style {
  @apply w-full px-4 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.input-style[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
}
</style>
