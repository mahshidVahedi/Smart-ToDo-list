// src/store/tasks.js
import { defineStore } from 'pinia'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: (() => {
      const raw = JSON.parse(localStorage.getItem('todo-tasks')) || []
      return raw.map(normalizeTask)
    })(),
    projects: JSON.parse(localStorage.getItem('todo-projects')) || [{ id: 2, name: 'شخصی' }],
    selectedProjectId: 0
  }),

  actions: {
    addTask(task) {
      const t = normalizeTask(task)
      if (!t.id) t.id = Date.now().toString()
      this.tasks.push(t)
      this.saveTasks()
    },

    updateTask(updatedTask) {
      const i = this.tasks.findIndex(t => t.id === updatedTask.id)
      if (i !== -1) {
        this.tasks[i] = normalizeTask({ ...this.tasks[i], ...updatedTask })
        this.saveTasks()
      }
    },

    deleteTask(id) {
      this.tasks = this.tasks.filter(t => t.id !== id)
      this.saveTasks()
    },

    toggleComplete(id) {
      const task = this.tasks.find(t => t.id === id)
      if (!task) return
      task.completed = !task.completed
      this.saveTasks()
    },

    reorderTasks(newList, pid) {
      const byId = new Map(this.tasks.map(t => [t.id, t]))
      const rebuilt = newList.map(item => {
        const old = byId.get(item.id) || {}
        const merged = { ...old, ...item } 
        return normalizeTask(merged)
      })
      const otherTasks = this.tasks.filter(t => !(pid === 0 || t.projectId === pid))
      this.tasks = [...otherTasks, ...rebuilt]
      this.saveTasks()
    },

    addProject(name) {
      this.projects.push({ id: Date.now(), name })
      this.saveProjects()
    },

    deleteProject(id) {
      this.projects = this.projects.filter(p => p.id !== id)
      this.tasks = this.tasks.filter(t => t.projectId !== id)
      this.saveProjects()
      this.saveTasks()
      if (this.selectedProjectId === id) this.selectedProjectId = 0
    },

    selectProject(id) {
      this.selectedProjectId = id
    },

    saveTasks() {
      localStorage.setItem('todo-tasks', JSON.stringify(this.tasks))
    },

    saveProjects() {
      localStorage.setItem('todo-projects', JSON.stringify(this.projects))
    },

    updateTaskFromSync(localId, patch) {
      const i = this.tasks.findIndex(t => t.id === localId)
      if (i === -1) return
      const allowed = pick(patch, ['googleTaskId', 'googleEventId'])
      this.tasks[i] = { ...this.tasks[i], ...allowed }
      this.saveTasks()
    },

    migrateTasksMeta() {
      let changed = false
      this.tasks = this.tasks.map(t => {
        const nt = normalizeTask(t)
        if (nt !== t) changed = true
        return nt
      })
      if (changed) this.saveTasks()
    }
  }
})

function normalizeTask(task) {
  const t = { ...task }
  if (t.googleTaskId === undefined) t.googleTaskId = null
  if (t.googleEventId === undefined) t.googleEventId = null
  if (t.completed === undefined) t.completed = false
  if (t.timeRange !== undefined && t.timeRange == null) t.timeRange = null
  return t
}

function pick(obj, keys) {
  const out = {}
  for (const k of keys) if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k]
  return out
}
