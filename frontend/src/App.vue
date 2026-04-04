<script setup lang="ts">
import { onMounted, ref } from 'vue'

const isSidebarOpen = ref(true)
const isLoading = ref(true)
const isDarkMode = ref(false)

onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  document.documentElement.classList.toggle('dark')
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-50/95 dark:bg-slate-950/95"
    >
      <div class="text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
          <svg class="h-8 w-8 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 2.042.767 3.903 2.038 5.317l1.962-2.026z" />
          </svg>
        </div>
        <p class="text-sm text-slate-500 dark:text-slate-400">Carregando Norte MT...</p>
      </div>
    </div>

    <div v-else class="flex min-h-screen overflow-hidden">
      <aside
        :class="[
          'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900',
          isSidebarOpen ? 'w-64' : 'w-20'
        ]"
      >
        <div class="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/25">
              <span class="text-sm font-bold">NM</span>
            </div>
            <div v-if="isSidebarOpen">
              <p class="text-sm font-semibold tracking-wide text-slate-900 dark:text-white">Norte MT</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">WhatsApp Platform</p>
            </div>
          </div>
        </div>

        <nav class="flex-1 space-y-1 px-3 py-4">
          <a
            v-for="item in [
              ['Dashboard', '/'],
              ['Conversas', '/tickets'],
              ['Instâncias', '/instances'],
              ['Configurações', '/settings']
            ]"
            :key="item[1]"
            href="#"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
            <span v-if="isSidebarOpen">{{ item[0] }}</span>
          </a>
        </nav>

        <div class="border-t border-slate-200 p-4 dark:border-slate-800">
          <p v-if="isSidebarOpen" class="text-xs text-slate-500 dark:text-slate-400">© 2026 Norte MT Sistemas</p>
        </div>
      </aside>

      <div :class="['flex min-h-screen flex-1 flex-col transition-all duration-300', isSidebarOpen ? 'ml-64' : 'ml-20']">
        <header class="flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90 md:px-6">
          <div class="flex items-center gap-3">
            <button
              class="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              @click="toggleSidebar"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div class="hidden md:block">
              <p class="text-sm font-semibold text-slate-900 dark:text-white">Painel Norte MT</p>
              <p class="text-xs text-slate-500 dark:text-slate-400">Gestão de chatbot WhatsApp</p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button
              class="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              @click="toggleDarkMode"
            >
              <svg v-if="isDarkMode" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            </button>

            <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white">U</div>
              <div class="hidden md:block">
                <p class="text-sm font-medium text-slate-900 dark:text-white">Usuário</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Administrador</p>
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-y-auto p-4 md:p-6">
          <router-view />
        </main>
      </div>
    </div>
  </div>
</template>