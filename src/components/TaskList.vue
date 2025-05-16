<template>
    <div>
      <draggable
        v-model="localTasks"
        item-key="id"
        handle=".drag-handle"
        @end="onReorder"
        class="space-y-4"
      >
        <template #item="{ element }">
          <div class="flex items-start gap-2">
            <span class="drag-handle cursor-move select-none text-gray-400 dark:text-gray-500">☰</span>
            <TaskItem
              :task="element"
              @toggle-complete="$emit('toggle-complete', element.id)"
              @delete-task="$emit('delete-task', element.id)"
            />
          </div>
        </template>
      </draggable>
  
      <p v-if="!localTasks.length" class="text-center text-gray-500 dark:text-gray-400 mt-4">
        لیستی از تسک‌ها وجود ندارد 😴
      </p>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue'
  import TaskItem from './TaskItem.vue'
  import draggable from 'vuedraggable'
  
  const props = defineProps({
    tasks: {
      type: Array,
      required: true,
    },
  })
  
  const emit = defineEmits(['toggle-complete', 'delete-task', 'reorder'])
  
  const localTasks = ref([...props.tasks])
  
  watch(
    () => props.tasks,
    (newTasks) => {
      localTasks.value = [...newTasks]
    },
    { deep: true }
  )
  
  const onReorder = () => {
    emit('reorder', [...localTasks.value])
  }
  </script>
  