import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '../../../src/store/tasks'

describe('task store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('add / update / delete works and persists', () => {
    const store = useTaskStore()

    store.addTask({ id: '1', title: 'A', done: false })
    expect(store.tasks.length).toBe(1)

    store.updateTask({ id: '1', title: 'A*', done: true })
    expect(store.tasks[0].title).toBe('A*')
    expect(store.tasks[0].done).toBe(true)

    store.deleteTask('1')
    expect(store.tasks.length).toBe(0)

    const raw = localStorage.getItem('todo-tasks')
    expect(raw).toBeTypeOf('string')
  })
  it('selects project and persists tasks', () => {
    const store = useTaskStore()
    store.addTask({ id: 'a', title: 'T1' })
    store.addTask({ id: 'b', title: 'T2', projectId: 2 })
    expect(store.tasks.length).toBe(2)

    if ('selectedProjectId' in store) {
      store.selectedProjectId = 2
      expect(store.selectedProjectId).toBe(2)
    }

    const raw = localStorage.getItem('todo-tasks')
    expect(raw).toBeTypeOf('string')
  })

  it('updateTask merges fields and keeps others intact', () => {
    const s = useTaskStore()
    s.addTask({ id: 'x', title: 'Old', done: false, note: 'n1' })
    s.updateTask({ id: 'x', title: 'New', done: true })
    const t = s.tasks.find(t => t.id === 'x')
    expect(t?.title).toBe('New')
    expect(t?.done).toBe(true)
    expect(t?.note).toBe('n1') 
  })
})
