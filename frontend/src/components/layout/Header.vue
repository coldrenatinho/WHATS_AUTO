<script setup lang="ts">
import Swal from 'sweetalert2'

interface Props {
  title?: string
  subtitle?: string
  userName?: string
  userRole?: string
  isDarkMode?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Painel Norte MT',
  subtitle: 'Operacao omnichannel em tempo real',
  userName: 'Usuario',
  userRole: 'Perfil',
  isDarkMode: false,
})

const emit = defineEmits<{
  (event: 'toggleSidebar'): void
  (event: 'toggleDarkMode'): void
  (event: 'logout'): void
}>()

const confirmLogout = async () => {
  const result = await Swal.fire({
    title: 'Sair da plataforma?',
    text: 'Você poderá entrar novamente com seu email e senha.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sair',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#10b981',
    cancelButtonColor: '#64748b',
  })

  if (result.isConfirmed) {
    emit('logout')
  }
}
</script>

<template>
  <header class="sticky top-2 z-20 mx-2 mt-2 flex min-h-16 items-center justify-between rounded-3xl border border-slate-200/70 bg-white/86 px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/82 md:mx-4 md:px-6">
    <div class="flex min-w-0 items-center gap-3">
      <button
        class="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        @click="emit('toggleSidebar')"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div class="hidden min-w-0 md:block">
        <p class="truncate text-sm font-semibold text-slate-900 dark:text-white">{{ props.title }}</p>
        <p class="truncate text-xs text-slate-500 dark:text-slate-400">{{ props.subtitle }}</p>
      </div>
    </div>

    <div class="flex items-center gap-3">
      <div class="hidden xl:block">
        <label class="relative block w-80">
          <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar conversas, agentes ou fluxos"
            class="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-emerald-900/30"
          />
        </label>
      </div>

      <button
        class="rounded-2xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        @click="emit('toggleDarkMode')"
      >
        <svg v-if="props.isDarkMode" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      </button>

      <div class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
        <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20">
          {{ props.userName?.charAt(0).toUpperCase() || 'U' }}
        </div>
        <div class="hidden md:block">
          <p class="text-sm font-medium text-slate-900 dark:text-white">{{ props.userName }}</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">{{ props.userRole }}</p>
        </div>
      </div>

      <button
        class="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        @click="confirmLogout"
      >
        Sair
      </button>
    </div>
  </header>
</template>