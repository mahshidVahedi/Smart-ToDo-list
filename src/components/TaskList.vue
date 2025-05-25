<template>
<div class="container max-w-lg mx-auto px-4 space-y-4">
  <draggable
      v-model="localTasks"
      item-key="id"
      handle=".drag-handle"
      @end="onReorder"
      class="space-y-3"
      ghost-class="drag-ghost"
      chosen-class="drag-chosen"
      animation="180"
    >
      <template #item="{ element }">
        <div class="flex items-start gap-2 group relative">

          <span
            class="drag-handle cursor-grab text-gray-400 dark:text-gray-500 text-lg transition-opacity opacity-60 group-hover:opacity-100"
            title="بکش و رها کن"
          >
            ☰
          </span>

          <TaskItem
            :task="element"
            @toggle-complete="$emit('toggle-complete', element.id)"
            @delete-task="$emit('delete-task', element.id)"
          />
        </div>
      </template>
    </draggable>

    <p v-if="!localTasks.length" class="text-center text-gray-500 dark:text-gray-400 mt-6">
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

<style scoped>
.drag-ghost {
  opacity: 0.4;
}
.drag-chosen {
  background-color: #e5e7eb; 
}
.dark .drag-chosen {
  background-color: #374151;
}
</style>
