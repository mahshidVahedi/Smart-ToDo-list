<template>
  <div class="p-4 flex flex-col items-center gap-4">
    <div v-if="!loggedIn">
      <button @click="login"
        class="flex items-center gap-2 px-5 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-full shadow hover:scale-105 transition active:scale-95">
        <img src="/src/assets/google-icon.svg" class="w-5 h-5" alt="Google" />
        <span class="text-sm font-medium text-gray-700 dark:text-gray-200">ورود با گوگل</span>
      </button>
    </div>

    <div v-else class="flex flex-col items-center gap-2 w-full max-w-xl">
      <span class="text-sm text-gray-700 dark:text-gray-300 self-start">{{ name }} خوش اومدی 👋</span>
      <button @click="logout" class="self-start mt-1 px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded-full">
        خروج از حساب گوگل
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { googleLogin, googleLogout, isGoogleLoggedIn, displayName } from '../sync/GoogleSync' 

const loggedIn = computed(()=> isGoogleLoggedIn.value)
const name = computed(()=> displayName.value)

const login = async ()=> { await googleLogin() }
const logout = ()=> { googleLogout() }
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
