<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

interface Instance {
  id: number
  name: string
  phone?: string
  evolution_instance: string
  status: 'connected' | 'disconnected' | 'connecting' | 'error'
}

const authStore = useAuthStore()
const instances = ref<Instance[]>([])
const loading = ref(true)

const form = ref({
  name: '',
  evolution_instance: '',
  phone: '',
})

const canManage = computed(() => ['admin', 'manager'].includes(authStore.user?.role || ''))

const statusLabel: Record<Instance['status'], string> = {
  connected: 'Conectado',
  disconnected: 'Desconectado',
  connecting: 'Conectando',
  error: 'Erro',
}

const loadInstances = async () => {
  try {
    const { data } = await api.get('/instances')
    instances.value = data
  } finally {
    loading.value = false
  }
}

const createInstance = async () => {
  if (!form.value.name || !form.value.evolution_instance) {
    return
  }

  await api.post('/instances', {
    name: form.value.name,
    evolution_instance: form.value.evolution_instance,
    phone: form.value.phone || undefined,
  })

  form.value = { name: '', evolution_instance: '', phone: '' }
  await loadInstances()
}

const connectInstance = async (id: number) => {
  await api.post(`/instances/${id}/connect`)
  await loadInstances()
}

onMounted(async () => {
  await loadInstances()
})
</script>

<template>
  <div class="space-y-5">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Instâncias WhatsApp</h1>
    <p class="text-gray-600 dark:text-gray-400 mt-2">Gerencie conexoes e disponibilidade dos numeros.</p>

    <div v-if="canManage" class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Conectar novo numero</h2>
      <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <input v-model="form.name" class="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" placeholder="Nome da instância" />
        <input v-model="form.evolution_instance" class="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" placeholder="ID Evolution (instanceName)" />
        <input v-model="form.phone" class="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" placeholder="Telefone (opcional)" />
        <button class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700" @click="createInstance">
          Salvar Instância
        </button>
      </div>
    </div>

    <div v-if="loading" class="rounded-xl border border-gray-200 bg-white p-5 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
      Carregando instâncias...
    </div>
    
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div v-for="instance in instances" :key="instance.id" class="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ instance.name }}</h3>
          <span class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="instance.status === 'connected' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'"
          >
            {{ statusLabel[instance.status] }}
          </span>
        </div>
        <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ instance.evolution_instance }}</p>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">{{ instance.phone || 'Sem telefone configurado' }}</p>

        <button
          v-if="canManage"
          class="mt-4 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          @click="connectInstance(instance.id)"
        >
          Conectar pela tela de gerência
        </button>
      </div>
    </div>
  </div>
</template>