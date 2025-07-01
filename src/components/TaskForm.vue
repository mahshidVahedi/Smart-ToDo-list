<template>
  <form @submit.prevent="handleSubmit"
    class="form-wrapper space-y-6 max-w-2xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
    <div v-if="!manualMode && !isEditMode">
      <!-- <label class="form-label"> ورودی متن هوشمند</label> -->
      <textarea v-model="form.title" class="title-input resize-y min-h-[100px]"
        placeholder="مثلاً: فردا ورزش ساعت 6 عصر، خرید هر هفته، مطالعه هر روز ساعت 22" required></textarea>
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
        <button type="button" @click="handleNLPSubmit" class="nlp-btn w-full sm:w-auto">✨ ساخت تسک از متن</button>

        <button @click="manualMode = true" type="button"
          class="text-sm text-blue-600 dark:text-blue-400 w-full sm:w-auto">🛠 رفتن به تنظیمات دستی</button>
      </div>
    </div>
    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div class="sm:col-span-2">
          <label class="form-label">عنوان تسک</label>
          <input v-model="form.title" type="text" class="input-style" placeholder="مثلاً: تمرین فوتبال" required />
        </div>

        <div>
          <label class="form-label">⏰ ساعت</label>
          <div class="flex gap-2">
            <select v-model="selectedMinute" class="input-style w-1/2">
              <option v-for="m in [0, 15, 30, 45]" :key="m" :value="m">{{ m.toString().padStart(2, '0') }}</option>
            </select>
            <select v-model="selectedHour" class="input-style w-1/2">
              <option v-for="h in 24" :key="h" :value="h">{{ h.toString().padStart(2, '0') }}</option>
            </select>
          </div>
        </div>

        <div>
          <label class="form-label">🔁 تکرار</label>
          <select v-model="form.repeat" class="input-style">
            <option value="">بدون تکرار</option>
            <option value="daily">هر روز</option>
            <option value="weekly">هر هفته</option>
          </select>
        </div>

        <div>
          <label class="form-label">⚡ اولویت</label>
          <select v-model="form.priority" class="input-style">
            <option value="">بدون اولویت</option>
            <option value="low">کم</option>
            <option value="medium">متوسط</option>
            <option value="important">مهم</option>
            <option value="high">فوری</option>
          </select>
        </div>

        <div>
          <label class="form-label">📅 تاریخ</label>
          <PersianDatePicker v-model="form.date" input-class="vpd-input" display-format="jYYYY/jMM/jDD"
            format="jYYYY/jMM/jDD" locale="fa" color="blue" :z-index="9999" :auto-submit="false" :position="'auto'"
            attach="body" :show-buttons="true" />

        </div>
      </div>

      <div class="form-actions mt-6 flex flex-col sm:flex-row gap-3 justify-end">
        <button type="submit" class="submit-btn w-full sm:w-auto">
          {{ isEditMode ? 'تأیید ویرایش' : 'افزودن تسک' }}
        </button>
        <button v-if="!isEditMode" type="button" class="cancel-btn w-full sm:w-auto" @click="manualMode = false">↩️
          بازگشت به تنظیمات هوشمند</button>
        <button v-if="isEditMode" type="button" class="cancel-btn w-full sm:w-auto"
          @click="handleCancel">انصراف</button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { parsePersianTask } from '../utils/nlp'
import PersianDatePicker from 'vue3-persian-datetime-picker'

const props = defineProps({
  isEditMode: Boolean,
  initialData: Object,
  projectId: Number
})

const emit = defineEmits(['toast', 'cancel', 'submit'])

const form = reactive({
  title: '',
  date: '',
  time: '',
  priority: '',
  repeat: ''
})

const selectedHour = ref(8)
const selectedMinute = ref(0)
const manualMode = ref(false)

watch(
  () => props.initialData,
  (newVal) => {
    if (props.isEditMode && newVal) {
      form.title = newVal.title || ''
      form.date = newVal.date || ''
      form.time = newVal.time || ''
      form.priority = newVal.priority || ''
      form.repeat = newVal.repeat || ''
      const [h, m] = (newVal.time || '08:00').split(':')
      selectedHour.value = parseInt(h)
      selectedMinute.value = parseInt(m)
      manualMode.value = true
    }
  },
  { immediate: true }
)

const handleCancel = () => {
  emit('cancel')
  resetForm()
}

const handleNLPSubmit = async () => {
  const trimmed = form.title.trim()
  if (!trimmed) return

  const parsedTasks = await parsePersianTask(trimmed)
  if (!parsedTasks.length) return emit('toast', 'متنی برای ساخت تسک قابل‌تشخیص نبود')

  parsedTasks.forEach(task => {
    emit('submit', {
      ...task,
      id: Date.now() + Math.floor(Math.random() * 1000),
      completed: false,
      projectId: props.projectId ?? 0
    })
  })

  emit('toast', '✨ تسک‌(ها) با موفقیت از متن ساخته شد!')
  resetForm()
  manualMode.value = false
}

const handleSubmit = () => {
  const trimmedTitle = form.title?.trim() || ''

  if (!trimmedTitle) {
    emit('toast', '❗ لطفاً عنوان تسک را وارد کنید.')
    return
  }

  const payload = {
    ...form,
    title: trimmedTitle,
    projectId: props.projectId ?? 0,
    id: props.initialData?.id || Date.now(),
    completed: false,
    time: `${selectedHour.value.toString().padStart(2, '0')}:${selectedMinute.value.toString().padStart(2, '0')}`
  }

  emit('submit', payload)

  if (!props.isEditMode) {
    emit('toast', '✅ تسک با موفقیت افزوده شد!')
    resetForm()
    manualMode.value = false
  } else {
    emit('toast', '✏️ تسک با موفقیت ویرایش شد!')
  }
}

const resetForm = () => {
  form.title = ''
  form.date = ''
  form.time = ''
  form.priority = ''
  form.repeat = ''
  selectedHour.value = 8
  selectedMinute.value = 0
}
</script>


<style scoped>
.title-input {
  @apply w-full px-4 py-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.input-style {
  @apply w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2;
}

.submit-btn {
  @apply px-5 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition;
}

.cancel-btn {
  @apply px-5 py-2 text-sm font-medium rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition;
}

.nlp-btn {
  @apply px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition;
}
</style>

<style>
.vpd-input {
  background-color: #fff;
  color: #1f2937;
  border: 1px solid #d1d5db;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  width: 100%;
  outline: none;
  transition: background-color 0.3s, color 0.3s;
}

html.dark .vpd-input {
  background-color: #374151;
  color: #f9fafb;
  border-color: #4b5563;
}

html.dark .vpd-content {
  background-color: #1f2937;
  color: white;
}
html.dark .vpd-title,
html.dark .vpd-header,
html.dark .vpd-actions {
  background-color: #111827;
  color: white;
}
html.dark .vpd-day.vpd-today {
  background-color: #2563eb;
  color: white;
}

</style>
