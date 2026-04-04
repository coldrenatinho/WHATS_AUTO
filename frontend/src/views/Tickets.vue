<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { toast } from 'vue3-toastify'
import api from '../services/api'

interface Ticket {
  id: number
  contact_name?: string
  contact_phone: string
  status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  instance?: { name: string }
  updated_at?: string
}

const tickets = ref<Ticket[]>([])
const loading = ref(true)
const searchQuery = ref('')
const updatingTicketId = ref<number | null>(null)

const statusLabel: Record<Ticket['status'], string> = {
  open: 'Aberto',
  pending: 'Pendente',
  in_progress: 'Em atendimento',
  resolved: 'Resolvido',
  closed: 'Fechado',
}

const statusClass: Record<Ticket['status'], string> = {
  open: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  in_progress: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  resolved: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  closed: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
}

const filteredTickets = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()

  if (!term) {
    return tickets.value
  }

  return tickets.value.filter((ticket) => {
    return [
      ticket.contact_name,
      ticket.contact_phone,
      ticket.instance?.name,
      statusLabel[ticket.status],
      ticket.priority,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term))
  })
})

const loadTickets = async () => {
  try {
    const { data } = await api.get('/tickets')
    tickets.value = data
  } finally {
    loading.value = false
  }
}

const updateStatus = async (ticketId: number, status: Ticket['status']) => {
  updatingTicketId.value = ticketId

  try {
    await api.patch(`/tickets/${ticketId}`, { status })
    toast.success('Status da conversa atualizado.')
    await loadTickets()
  } catch {
    toast.error('Não foi possível atualizar esta conversa.')
  } finally {
    updatingTicketId.value = null
  }
}

const handleStatusChange = (ticketId: number, event: Event) => {
  const target = event.target as HTMLSelectElement | null

  if (!target) {
    return
  }

  updateStatus(ticketId, target.value as Ticket['status'])
}

onMounted(async () => {
  await loadTickets()
})
</script>

<template>
  <div class="space-y-5">
    <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Conversas</h1>
        <p class="mt-2 text-gray-600 dark:text-gray-400">Acompanhe sua fila em tempo real e priorize atendimentos.</p>
      </div>

      <label class="relative block w-full lg:w-96">
        <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400 dark:text-gray-500">
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nome, telefone, instância ou status"
          class="w-full rounded-xl border border-gray-300 bg-white py-3 pl-9 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:focus:ring-emerald-900/30"
        />
      </label>
    </div>
    
    <div v-if="loading" class="rounded-xl border border-gray-200 bg-white p-4 text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
      Carregando conversas...
    </div>

    <div v-else class="grid grid-cols-1 gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <div v-if="filteredTickets.length === 0" class="rounded-lg border border-dashed border-gray-300 p-5 text-gray-600 dark:border-gray-600 dark:text-gray-300">
        Nenhuma conversa registrada ainda.
      </div>

      <div v-for="item in filteredTickets" :key="item.id" class="flex flex-col gap-3 rounded-lg border border-gray-200/80 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="font-semibold text-gray-900 dark:text-white">{{ item.contact_name || item.contact_phone }}</p>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ item.instance?.name || 'Instância não vinculada' }} • Prioridade {{ item.priority }}
          </p>
          <p v-if="item.updated_at" class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Atualizado em {{ dayjs(item.updated_at).format('DD/MM/YYYY HH:mm') }}
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="statusClass[item.status]">
            {{ statusLabel[item.status] }}
          </span>
          <select
            class="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
            :value="item.status"
            :disabled="updatingTicketId === item.id"
            @change="(event) => handleStatusChange(item.id, event)"
          >
            <option value="open">Aberto</option>
            <option value="pending">Pendente</option>
            <option value="in_progress">Em atendimento</option>
            <option value="resolved">Resolvido</option>
            <option value="closed">Fechado</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>