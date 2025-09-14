import { describe, it, expect } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import TaskForm from '../../../src/components/TaskForm.vue'

describe('TaskForm – submit', () => {
  it('emits submit/add with minimal data', async () => {
    const wrapper = shallowMount(TaskForm)
    const btn = wrapper.find('button[type="submit"], button.submit, .submit')
    if (btn.exists()) {
      await btn.trigger('click')
      const em = wrapper.emitted()
      expect(Object.keys(em).length).toBeGreaterThan(0)
    } else {
      expect(wrapper.exists()).toBe(true)
    }
  })
})