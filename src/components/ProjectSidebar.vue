<template>
    <aside class="w-full md:w-60 bg-white dark:bg-gray-800 p-4 rounded-xl shadow space-y-3">
      <h2 class="text-lg font-bold text-gray-700 dark:text-gray-100 mb-2">پروژه‌ها 📁</h2>
  
      <ul class="space-y-2">
        <li
          v-for="project in projects"
          :key="project.id"
          class="flex items-center justify-between px-3 py-2 rounded cursor-pointer transition"
          :class="[
            selectedId === project.id
              ? 'bg-blue-100 dark:bg-blue-600 text-blue-900 dark:text-white font-bold'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
          ]"
        >
          <span @click="$emit('select-project', project.id)" class="flex-1 truncate">
            {{ project.name }}
          </span>
          <button
            v-if="project.id !== 1"
            @click="$emit('delete-project', project.id)"
            class="text-red-500 hover:text-red-700 text-sm ml-2"
            title="حذف پروژه"
          >
            🗑️
          </button>
        </li>
      </ul>
  
      <form @submit.prevent="addProject" class="mt-4 flex gap-2">
        <input
          v-model="newProject"
          type="text"
          placeholder="نام پروژه جدید"
          class="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
        />
        <button
          type="submit"
          class="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          +
        </button>
      </form>
    </aside>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
    projects: Array,
    selectedId: Number
  })
  
  const emit = defineEmits(['select-project', 'add-project', 'delete-project'])
  
  const newProject = ref('')
  
  const addProject = () => {
    if (newProject.value.trim()) {
      emit('add-project', newProject.value.trim())
      newProject.value = ''
    }
  }
  </script>
  