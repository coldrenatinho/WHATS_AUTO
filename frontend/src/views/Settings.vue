<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { toast } from 'vue3-toastify'
import { useAuthStore } from '../stores/auth'
import { UiCard, UiSectionHeader } from '../components/ui'

const authStore = useAuthStore()

const storageKey = 'whatsauto-settings-toggles'
const savedAtKey = 'whatsauto-settings-toggles-saved-at'

const toggles = ref([
  { nome: 'Receber alerta de fila alta', ativo: true },
  { nome: 'Distribuicao automatica de tickets', ativo: true },
  { nome: 'Modo silencio fora do horario', ativo: false },
])

const lastSavedAt = ref('')

const activeToggles = computed(() => toggles.value.filter((item) => item.ativo).length)

onMounted(() => {
  const rawToggles = localStorage.getItem(storageKey)
  const savedAt = localStorage.getItem(savedAtKey)

  if (rawToggles) {
    try {
      const parsed = JSON.parse(rawToggles)
      if (Array.isArray(parsed)) {
        toggles.value = parsed
      }
    } catch {
      localStorage.removeItem(storageKey)
    }
  }

  if (savedAt) {
    lastSavedAt.value = savedAt
  }
})

const saveSettings = () => {
  const formatted = dayjs().format('DD/MM/YYYY HH:mm')
  localStorage.setItem(storageKey, JSON.stringify(toggles.value))
  localStorage.setItem(savedAtKey, formatted)
  lastSavedAt.value = formatted
  toast.success('Preferências salvas com sucesso.')
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <UiSectionHeader title="Configuracoes" subtitle="Ajustes da sua operacao e preferencias da equipe." compact />

      <div class="text-sm text-gray-500 dark:text-gray-400">
        {{ activeToggles }} de {{ toggles.length }} automações ativas
      </div>
    </div>
    
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <UiCard>
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Conta</h2>
        <div class="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p><span class="font-semibold text-gray-900 dark:text-gray-100">Empresa:</span> {{ authStore.company?.name || 'Nao informado' }}</p>
          <p><span class="font-semibold text-gray-900 dark:text-gray-100">Plano:</span> {{ authStore.company?.plan || 'Nao informado' }}</p>
          <p><span class="font-semibold text-gray-900 dark:text-gray-100">Subdominio:</span> {{ authStore.company?.subdomain || 'Nao informado' }}</p>
          <p v-if="lastSavedAt"><span class="font-semibold text-gray-900 dark:text-gray-100">Último ajuste:</span> {{ lastSavedAt }}</p>
        </div>
      </UiCard>

      <UiCard>
        <div class="flex items-center justify-between gap-3">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Automacoes</h2>
          <button
            type="button"
            class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
            @click="saveSettings"
          >
            Salvar preferências
          </button>
        </div>
        <div class="mt-4 space-y-3">
          <label v-for="item in toggles" :key="item.nome" class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-900">
            <span class="text-sm text-gray-700 dark:text-gray-300">{{ item.nome }}</span>
            <button
              type="button"
              class="rounded-full px-3 py-1 text-xs font-semibold transition"
              :class="item.ativo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'"
              @click="item.ativo = !item.ativo"
            >
              {{ item.ativo ? 'Ativo' : 'Inativo' }}
            </button>
          </label>
        </div>
      </UiCard>
    </div>
  </div>
</template>