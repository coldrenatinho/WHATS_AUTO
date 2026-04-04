<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  isOpen: boolean
  userRole?: string
}

const props = defineProps<Props>()
const route = useRoute()

const menuItems = [
  { path: '/', icon: 'home', label: 'Dashboard' },
  { path: '/tickets', icon: 'chat', label: 'Conversas' },
  { path: '/instances', icon: 'phone', label: 'Instancias' },
  { path: '/flows', icon: 'flow', label: 'Automacoes' },
  { path: '/settings', icon: 'cog', label: 'Configuracoes' },
  { path: '/admin/users', icon: 'shield', label: 'Admin • Usuarios', roles: ['admin', 'manager'] },
]

const visibleItems = computed(() => {
  return menuItems.filter((item) => {
    if (!item.roles?.length) {
      return true
    }

    return item.roles.includes(props.userRole || '')
  })
})

const isActive = (path: string) => route.path === path
</script>

<template>
  <aside
    :class="[
      'fixed inset-y-2 left-2 z-30 flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white/92 shadow-2xl shadow-slate-200/40 backdrop-blur-xl transition-all duration-300 dark:border-slate-800 dark:bg-slate-900/88 dark:shadow-black/20 md:inset-y-4 md:left-4',
      isOpen ? 'w-64' : 'w-16'
    ]"
  >
    <div class="flex h-16 items-center justify-between border-b border-slate-200/70 px-4 dark:border-slate-800">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/25">
          <span class="text-sm font-bold tracking-[0.18em]">NM</span>
        </div>
        <div v-if="isOpen" class="leading-tight">
          <p class="text-sm font-semibold text-slate-900 dark:text-white">Norte MT</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Control Center</p>
        </div>
      </div>
    </div>

    <div v-if="isOpen" class="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
      Navegacao principal para operacao, atendimento e configuracao.
    </div>

    <nav class="flex-1 space-y-1 px-3 py-3 overflow-y-auto">
      <router-link
        v-for="item in visibleItems"
        :key="item.path"
        :to="item.path"
        :title="item.label"
        :class="[
          'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive(item.path)
            ? 'bg-gradient-to-r from-emerald-500/12 to-orange-400/12 text-emerald-700 ring-1 ring-emerald-400/30 dark:text-emerald-300'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        ]"
      >
        <svg v-if="item.icon === 'home'" class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <svg v-else-if="item.icon === 'chat'" class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <svg v-else-if="item.icon === 'phone'" class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <svg v-else-if="item.icon === 'flow'" class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <svg v-else-if="item.icon === 'cog'" class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <svg v-else-if="item.icon === 'shield'" class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3l7 4v5c0 5-3.5 9.74-7 10-3.5-.26-7-5-7-10V7l7-4z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4" />
        </svg>

        <span v-if="isOpen" class="whitespace-nowrap">{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="border-t border-slate-200/70 p-4 dark:border-slate-800">
      <div v-if="isOpen" class="text-center text-xs text-slate-500 dark:text-slate-400">
        © 2026 Norte MT Sistemas
      </div>
    </div>
  </aside>
</template>