import { defineStore } from 'pinia'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: JSON.parse(localStorage.getItem('todo-tasks')) || [],
    projects: JSON.parse(localStorage.getItem('todo-projects')) || [{ id: 2, name: 'شخصی' }],
    selectedProjectId: 0
  }),

  actions: {
    addTask(task) {
      this.tasks.push(task)
      this.saveTasks()
    },
    updateTask(updatedTask) {
      const i = this.tasks.findIndex(t => t.id === updatedTask.id)
      if (i !== -1) this.tasks[i] = { ...this.tasks[i], ...updatedTask }
      this.saveTasks()
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
      const otherTasks = this.tasks.filter(t => !(pid === 0 || t.projectId === pid))
      this.tasks = [...otherTasks, ...newList]
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

      if (this.selectedProjectId === id) {
        this.selectedProjectId = 0
      }
    },
    selectProject(id) {
      this.selectedProjectId = id
    },
    saveTasks() {
      localStorage.setItem('todo-tasks', JSON.stringify(this.tasks))
    },
    saveProjects() {
      localStorage.setItem('todo-projects', JSON.stringify(this.projects))
    }
  }
})
