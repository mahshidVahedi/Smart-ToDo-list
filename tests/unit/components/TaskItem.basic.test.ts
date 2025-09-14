import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import TaskItem from '../../../src/components/TaskItem.vue'
import { useTaskStore } from '../../../src/store/tasks'

describe('TaskItem.vue', () => {
  const makeWrapper = (overrides = {}) => {
    const toggleComplete = vi.fn()
    const startEditTask = vi.fn()

    const task = {
      id: '1',
      title: 'تست',
      completed: false,
      projectId: 2,
      date: '1403/06/01',
      time: '10:00',
      repeat: 'daily',
      priority: 'مهم',
    }

    const wrapper = shallowMount(TaskItem, {
      props: { task, ...overrides },
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: true })],
        provide: { toggleComplete, startEditTask },
        stubs: { Transition: false, Teleport: true },
      },
    })

    return { wrapper, toggleComplete, startEditTask, task }
  }

  it('renders title and default tags', () => {
    const { wrapper } = makeWrapper()
    expect(wrapper.text()).toContain('تست')
    expect(wrapper.text()).toContain('📅')
    expect(wrapper.text()).toContain('🕒')
    expect(wrapper.text()).toContain('🔁 هر روز')
  })

  it('calls toggleComplete when checkbox clicked', async () => {
    const { wrapper, toggleComplete, task } = makeWrapper()
    const checkbox = wrapper.get('input[type="checkbox"]')
    await checkbox.setValue(true)
    expect(toggleComplete).toHaveBeenCalledWith(task.id)
  })

  it('calls startEditTask when edit button clicked', async () => {
    const { wrapper, startEditTask, task } = makeWrapper()
    const editBtn = wrapper.find('button[title="ویرایش"]')
    await editBtn.trigger('click')
    expect(startEditTask).toHaveBeenCalledWith(task)
  })

  it('calls deleteTask in store when delete button clicked', async () => {
    const { wrapper, task } = makeWrapper()
    const store = useTaskStore()
    store.deleteTask = vi.fn()

    const deleteBtn = wrapper.find('button[title="حذف"]')
    await deleteBtn.trigger('click')
    expect(store.deleteTask).toHaveBeenCalledWith(task.id)
  })

  it('sets correct class for priority', () => {
    const { wrapper } = makeWrapper({ task: { id: '2', title: 'X', priority: 'کم' } })
    const classes = wrapper.classes().join(' ')
    expect(classes).toContain('border-r-green-500')
  })
})
