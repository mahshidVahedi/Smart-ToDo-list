<template>
  <form @submit.prevent="handleSubmit" class="form-wrapper relative">
    <div class="relative">
      <input v-model="form.title" type="text" class="title-input"
        placeholder="مثلاً: جلسه مهم هر شنبه عصر ساعت ۴ در ۲۵ تیر" required />

      <div class="icon-buttons">
        <button type="button" @click="toggleTime" title="ساعت">⏰</button>
        <button type="button" @click="toggleRepeat" title="تکرار">🔁</button>
        <button type="button" @click="togglePriority" title="اولویت">⚡</button>
      </div>

      <transition name="fade">
        <div v-if="showDate" class="absolute z-50 top-full mt-2 w-72 sm:w-80" @click.self="showDate = false">
          <div class="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-md p-4 space-y-4">
            <h3 class="text-sm font-semibold text-gray-700 dark:text-white">انتخاب تاریخ</h3>
            <PersianDatePicker class="dark-datepicker dark-datepicker-input" input-class="dark-datepicker-input"
              v-model="tempDate" display-format="jYYYY/jMM/jDD" format="jYYYY/jMM/jDD" locale="fa" color="blue"
              :inline="true" :auto-submit="true" />
            <p class="text-xs text-gray-500 dark:text-gray-400">تاریخ انتخاب‌شده: {{ tempDate || '...' }}</p>
            <div class="flex gap-2 justify-end">
              <button @click="() => { showDate = false; tempDate = form.date }"
                class="cancel-btn flex-1">انصراف</button>
              <button @click="() => { form.date = tempDate; showDate = false }" class="submit-btn flex-1">تأیید</button>
            </div>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="showTime" class="absolute z-50 top-full mt-2 right-0 sm:right-12 w-60" ref="timeRef">
          <div class="bg-white dark:bg-gray-800 border rounded shadow p-3">
            <label class="block mb-1 text-sm text-gray-700 dark:text-gray-300">ساعت</label>
            <select v-model="selectedHour" class="input-style mb-2">
              <option v-for="h in 24" :key="h" :value="h">{{ h.toString().padStart(2, '0') }}</option>
            </select>

            <label class="block mb-1 text-sm text-gray-700 dark:text-gray-300">دقیقه</label>
            <select v-model="selectedMinute" class="input-style mb-3">
              <option v-for="m in [0, 15, 30, 45]" :key="m" :value="m">{{ m.toString().padStart(2, '0') }}</option>
            </select>

            <div class="flex gap-2">
              <button type="button" @click="confirmTime" class="submit-btn flex-1">تأیید</button>
              <button type="button" @click="showTime = false" class="cancel-btn flex-1">انصراف</button>
            </div>
          </div>
        </div>
      </transition>



      <transition name="fade">
        <div v-if="showPriority"
          class="absolute z-50 mt-2 left-14 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow p-3 w-60"
          ref="priorityRef">
          <select v-model="form.priority" class="input-style">
            <option value="">بدون اولویت</option>
            <option value="low">کم</option>
            <option value="medium">متوسط</option>
            <option value="important">مهم</option>
            <option value="high">فوری</option>
          </select>
        </div>
      </transition>

      <transition name="fade">
        <div v-if="showRepeat"
          class="absolute z-50 mt-2 left-28 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow p-3 w-60"
          ref="repeatRef">
          <select v-model="form.repeat" class="input-style">
            <option value="">بدون تکرار</option>
            <option value="daily">هر روز</option>
            <option value="weekly">هر هفته</option>
          </select>
        </div>
      </transition>


    </div>

    <div class="mt-4">
      <label class="form-label">تاریخ</label>
      <PersianDatePicker class="dark-datepicker dark-datepicker-input" v-model="form.date"
        display-format="jYYYY/jMM/jDD" format="jYYYY/jMM/jDD" locale="fa" color="blue" style="width: 100%" />
    </div>


    <div class="flex flex-col sm:flex-row gap-3 pt-4 justify-end w-full">
      <button type="submit" class="submit-btn w-full sm:flex-1">
        {{ isEditMode ? 'تأیید' : 'افزودن تسک' }}
      </button>
      <button v-if="!isEditMode" type="button" @click="handleNLPSubmit"
        class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition">
        ساخت تسک از متن ✨
      </button>
      <button v-if="isEditMode" type="button" class="cancel-btn w-full sm:flex-1" @click="$emit('cancel')">
        انصراف
      </button>
    </div>


  </form>
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { reactive, ref, watch, defineAsyncComponent } from 'vue'

const PersianDatePicker = defineAsyncComponent(() => import('vue3-persian-datetime-picker'))

const props = defineProps({
  initialData: Object,
  isEditMode: Boolean,
  projectId: Number
})

const emit = defineEmits(['submit', 'cancel', 'toast'])

const form = reactive({
  title: '',
  date: '',
  time: '',
  priority: '',
  repeat: ''
})

const showDate = ref(false)
const tempDate = ref('')
const showTime = ref(false)
const showPriority = ref(false)
const showRepeat = ref(false)

const selectedHour = ref(8)
const selectedMinute = ref(0)

const toggleDate = () => {
  showDate.value = !showDate.value
  showTime.value = false
}

const toggleTime = () => {
  showTime.value = !showTime.value
  showDate.value = false
}

const confirmTime = () => {
  const h = selectedHour.value.toString().padStart(2, '0');
  const m = selectedMinute.value.toString().padStart(2, '0');
  form.time = `${h}:${m}`;
  showTime.value = false;
};

watch(
  () => props.initialData,
  (newVal) => {
    if (newVal && props.isEditMode) {
      form.title = newVal.title || ''
      form.date = newVal.date || '';
      tempDate.value = newVal.date || ''
      form.time = newVal.time || ''
      form.priority = newVal.priority || ''
      form.repeat = newVal.repeat || ''
    }
  },
  { immediate: true }
)

const togglePriority = () => {
  showPriority.value = !showPriority.value;
  showRepeat.value = false;
  showDate.value = false;
  showTime.value = false;
};

const toggleRepeat = () => {
  showRepeat.value = !showRepeat.value;
  showPriority.value = false;
  showDate.value = false;
  showTime.value = false;
};

const timeRef = ref(null);
const priorityRef = ref(null);
const repeatRef = ref(null);

function handleClickOutside(e) {
  if (showTime.value && timeRef.value && !timeRef.value.contains(e.target)) showTime.value = false;
  if (showPriority.value && priorityRef.value && !priorityRef.value.contains(e.target)) showPriority.value = false;
  if (showRepeat.value && repeatRef.value && !repeatRef.value.contains(e.target)) showRepeat.value = false;
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('mousedown', handleClickOutside));

const nlpText = ref('');
const nlpError = ref('');

import { parsePersianTask } from '../utils/nlp';

const handleNLPSubmit = async () => {
  const trimmed = form.title.trim();
  if (!trimmed) {
    nlpError.value = 'لطفاً یک جمله وارد کنید';
    return;
  }

  nlpError.value = '';
  const parsedTasks = await parsePersianTask(trimmed);

  if (!parsedTasks.length) {
    nlpError.value = 'متنی برای ساخت تسک قابل‌تشخیص نبود';
    return;
  }

  for (const task of parsedTasks) {
    emit('submit', {
      ...task,
      id: Date.now() + Math.floor(Math.random() * 1000),
      completed: false,
      projectId: props.projectId >= 1 ? props.projectId : 0
    });
  }

  emit('toast', '✅ تسک(ها) با موفقیت از متن ساخته شد!');
  form.title = '';
};

const handleSubmit = () => {
  const trimmed = form.title.trim();
  if (!trimmed) {
    return;
  }

  const payload = {
    ...form,
    title: trimmed,
    projectId: props.projectId,
    id: props.initialData?.id || Date.now()
  };

  emit('submit', payload);

  const msg = props.isEditMode
    ? '✏️ تسک با موفقیت ویرایش شد!'
    : '✅ تسک با موفقیت افزوده شد!';

  emit('toast', msg);

  if (!props.isEditMode) {
    form.title = '';
    form.date = '';
    form.time = '';
    form.priority = '';
    form.repeat = '';
  }

  showDate.value = false;
  showTime.value = false;
};
</script>

<style scoped>
.form-wrapper {
  @apply bg-gray-50 dark:bg-gray-800 p-5 sm:p-6 rounded-xl shadow-md space-y-4 border border-gray-200 dark:border-gray-700 max-w-lg mx-auto;
}

.title-input {
  @apply w-full px-4 py-2 pr-12 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500;
  direction: rtl;
}

.icon-buttons {
  @apply absolute inset-y-0 left-0 flex items-center px-2 space-x-2;
  direction: ltr;
}

.input-style {
  @apply w-full px-4 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2;
}

.submit-btn {
  @apply px-5 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition;
}

.cancel-btn {
  @apply px-5 py-2 text-sm font-medium rounded-lg bg-gray-500 text-white hover:bg-gray-600 transition;
}

.dark-datepicker input {
  background-color: #374151 !important;
  color: #fff !important;
  border-color: #4b5563 !important;
}

.dark-datepicker .vpd-content {
  background-color: #1f2937 !important;
  color: #fff !important;
}

.dark-datepicker .vpd-content .selected {
  background-color: #2563eb !important;
  color: white !important;
}
</style>
