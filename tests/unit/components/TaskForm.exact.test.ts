import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskForm from '../../../src/components/TaskForm.vue'

vi.mock('../../../src/utils/nlp', () => ({
  parsePersianTask: vi.fn(async (txt: string) => {
    if (!txt?.trim()) return []
    return [
      { title: 'از NLP 1', date: '1403/06/20', time: '10:30', priority: 'medium', repeat: '' },
      { title: 'از NLP 2', timeRange: { from: '08:00', to: '09:00' }, priority: 'low', repeat: 'weekly' },
    ]
  }),
}))

vi.mock('vue3-persian-datetime-picker', () => ({
  default: {
    name: 'PersianDatePicker',
    props: ['modelValue', 'inputClass', 'displayFormat', 'format', 'locale', 'color', 'zIndex', 'autoSubmit', 'position', 'attach', 'showButtons'],
    emits: ['update:modelValue'],
    template: `<input data-test="vpd" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)" />`,
  },
}))
function findByButtonText(wrapper: any, text: string) {
  const btns = wrapper.findAll('button')
  return btns.find((b: any) => b.text().includes(text))
}
async function clickByText(wrapper: any, text: string) {
  const btn = findByButtonText(wrapper, text)
  if (!btn) throw new Error(`Button with text "${text}" not found`)
  await btn.trigger('click')
}

function mountForm(props?: Record<string, any>) {
  const wrapper = mount(TaskForm, {
    props: { isEditMode: false, projectId: 0, ...props },
    global: {
      stubs: { Transition: false, Teleport: true },
    },
  })
  return wrapper
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TaskForm.vue (exact)', () => {
  it('حالت اولیه: NLP-mode با textarea و دکمه‌های NLP/رفتن به دستی', async () => {
    const wrapper = mountForm()
    expect(wrapper.find('textarea.title-input').exists()).toBe(true)
    expect(wrapper.get('button.nlp-btn').text()).toContain('ساخت تسک از متن')
await clickByText(wrapper, '🛠 رفتن به تنظیمات دستی')
    expect(wrapper.text()).toContain('عنوان تسک')
  })

  it('NLP submit: parsePersianTask صدا می‌خورد و برای هر تسک emit("submit") می‌شود', async () => {
    const wrapper = mountForm()
    const ta = wrapper.get('textarea.title-input')
    await ta.setValue('یک متن تستی برای NLP')
    await wrapper.get('button.nlp-btn').trigger('click')

    const emits = wrapper.emitted()
    expect(emits.submit?.length).toBe(2)
    expect(emits.toast?.[0]?.[0]).toContain('✨ تسک‌(ها) با موفقیت از متن ساخته شد')

    expect(wrapper.find('textarea.title-input').exists()).toBe(true)
  })

  it('NLP submit با متن خالی: هیچ سابمیتی رخ ندهد', async () => {
    const wrapper = mountForm()
    await wrapper.get('button.nlp-btn').trigger('click')
    const emits = wrapper.emitted()
    expect(emits.submit).toBeUndefined()
  })


  it('cancel در حالت ویرایش فقط emit("cancel") کند', async () => {
    const wrapper = mountForm({ isEditMode: true, initialData: { title: 'X' } })
    const cancelBtn = wrapper.get('button.cancel-btn')
    await cancelBtn.trigger('click')
    expect(wrapper.emitted().cancel?.length).toBe(1)
  })

  
})
