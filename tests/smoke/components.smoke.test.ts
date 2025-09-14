import { describe, it, expect, vi } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'

import App from '../../src/App.vue'
import FilterBarMobile from '../../src/components/FilterBarMobile.vue'
import FiltersBar from '../../src/components/FiltersBar.vue'
import GoogleSync from '../../src/components/GoogleSync.vue'
import ProjectSidebar from '../../src/components/ProjectSidebar.vue'
import ProjectSidebarMobile from '../../src/components/ProjectSidebarMobile.vue'
import TaskForm from '../../src/components/TaskForm.vue'
import TaskItem from '../../src/components/TaskItem.vue'
import TaskList from '../../src/components/TaskList.vue'
import TaskStats from '../../src/components/TaskStats.vue'

const comps = {
  App,
  FilterBarMobile,
  FiltersBar,
  GoogleSync,
  ProjectSidebar,
  ProjectSidebarMobile,
  TaskForm,
  TaskItem,
  TaskList,
  TaskStats,
}

describe('Smoke mount (manual import)', () => {
  const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: true })

  const globals = {
    global: {
      plugins: [pinia],
      stubs: { Transition: false, Teleport: true },
      provide: {
        toggleComplete: vi.fn(),
        startEditTask: vi.fn(),
        filteredTasks: [], 
      },
    },
  }

  for (const [name, comp] of Object.entries(comps)) {
    it(`mounts: ${name}`, () => {
      const wrapper = shallowMount(comp as any, globals as any)
      expect(wrapper.exists()).toBe(true)
    })
  }
})
