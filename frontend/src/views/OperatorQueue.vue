<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { toast } from 'vue3-toastify'
import api from '../services/api'
import type { AxiosError } from 'axios'

// ═══════════════════════════════════════════════════════════════
// Tipos
// ═══════════════════════════════════════════════════════════════

interface Ticket {
  id: number
  contact_name?: string
  contact_phone: string
  status: 'open' | 'pending' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  instance?: { name: string }
  user_id?: number
  agent?: { name: string }
  updated_at?: string
}

interface TicketMessage {
  id: number
  direction: 'inbound' | 'outbound'
  content?: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  created_at?: string
}

interface MessageTemplate {
  id: number
  name: string
  content: string
  category?: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
}

// ═══════════════════════════════════════════════════════════════
// Estado Reativo
// ═══════════════════════════════════════════════════════════════

const tickets = ref<Ticket[]>([])
const templates = ref<MessageTemplate[]>([])
const users = ref<User[]>([])
const loading = ref(true)
const searchQuery = ref('')
const selectedTicketId = ref<number | null>(null)
const messagesByTicketId = ref<Record<number, TicketMessage[]>>({})
const messagesLoadingByTicketId = ref<Record<number, boolean>>({})
const sendingMessageByTicketId = ref<Record<number, boolean>>({})
const messageDraftByTicketId = ref<Record<number, string>>({})
const showTransferModal = ref(false)
const transferTargetUserId = ref<number | null>(null)
const transferringTicketId = ref<number | null>(null)
const showTemplateModal = ref(false)
const selectedTemplateId = ref<number | null>(null)

// Status e prioridade
const statusLabel: Record<Ticket['status'], string> = {
  open: 'Aberto',
  pending: 'Pendente',
  in_progress: 'Em atendimento',
  resolved: 'Resolvido',
  closed: 'Finalizado',
}

const statusClass: Record<Ticket['status'], string> = {
  open: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  resolved: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
  closed: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
}

const priorityLabel: Record<Ticket['priority'], string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
}

const priorityClass: Record<Ticket['priority'], string> = {
  low: 'text-slate-500',
  medium: 'text-yellow-500',
  high: 'text-orange-500',
  urgent: 'text-red-500 font-bold',
}

// ═══════════════════════════════════════════════════════════════
// Computed
// ═══════════════════════════════════════════════════════════════

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

const selectedTicket = computed(() => {
  return tickets.value.find((t) => t.id === selectedTicketId.value)
})

const selectedTicketMessages = computed(() => {
  return selectedTicketId.value ? messagesByTicketId.value[selectedTicketId.value] || [] : []
})

const templatesByCategory = computed(() => {
  const grouped: Record<string, MessageTemplate[]> = {}

  templates.value.forEach((template) => {
    const category = template.category || 'custom'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(template)
  })

  return grouped
})

const categoryLabel: Record<string, string> = {
  greeting: 'Saudação',
  closing: 'Encerramento',
  help: 'Ajuda',
  transfer: 'Transferência',
  custom: 'Personalizado',
}

// ═══════════════════════════════════════════════════════════════
// Métodos
// ═══════════════════════════════════════════════════════════════

const setMessagesLoading = (ticketId: number, value: boolean) => {
  messagesLoadingByTicketId.value = {
    ...messagesLoadingByTicketId.value,
    [ticketId]: value,
  }
}

const setSendingMessage = (ticketId: number, value: boolean) => {
  sendingMessageByTicketId.value = {
    ...sendingMessageByTicketId.value,
    [ticketId]: value,
  }
}

const loadTickets = async () => {
  try {
    loading.value = true
    const { data } = await api.get('/tickets')
    tickets.value = data
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao carregar conversas'
    toast.error(message)
  } finally {
    loading.value = false
  }
}

const loadTemplates = async () => {
  try {
    const { data } = await api.get('/templates/messages')
    templates.value = data
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao carregar templates'
    toast.error(message)
  }
}

const loadUsers = async () => {
  try {
    const { data } = await api.get('/users')
    users.value = data.filter((u: User) => u.role === 'agent' || u.role === 'manager')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao carregar usuários'
    toast.error(message)
  }
}

const selectTicket = async (ticketId: number) => {
  selectedTicketId.value = ticketId

  if (!messagesByTicketId.value[ticketId]) {
    await loadTicketMessages(ticketId)
  }
}

const loadTicketMessages = async (ticketId: number) => {
  setMessagesLoading(ticketId, true)

  try {
    const { data } = await api.get(`/messages/tickets/${ticketId}`)
    messagesByTicketId.value = {
      ...messagesByTicketId.value,
      [ticketId]: data,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao carregar mensagens'
    toast.error(message)
  } finally {
    setMessagesLoading(ticketId, false)
  }
}

const sendMessage = async (ticketId: number) => {
  const content = messageDraftByTicketId.value[ticketId]?.trim()

  if (!content) {
    toast.warning('Mensagem não pode estar vazia')
    return
  }

  setSendingMessage(ticketId, true)

  try {
    const { data } = await api.post(`/messages/tickets/${ticketId}/text`, {
      content,
    })

    const messages = messagesByTicketId.value[ticketId] || []
    messagesByTicketId.value = {
      ...messagesByTicketId.value,
      [ticketId]: [...messages, data],
    }

    messageDraftByTicketId.value[ticketId] = ''
    toast.success('Mensagem enviada')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao enviar mensagem'
    toast.error(message)
  } finally {
    setSendingMessage(ticketId, false)
  }
}

const applyTemplate = (templateId: number) => {
  if (!selectedTicketId.value) return

  const template = templates.value.find((t) => t.id === templateId)
  if (template) {
    messageDraftByTicketId.value[selectedTicketId.value] = template.content
    showTemplateModal.value = false
    selectedTemplateId.value = null
  }
}

const openTransferModal = (ticketId: number) => {
  transferringTicketId.value = ticketId
  transferTargetUserId.value = null
  showTransferModal.value = true
}

const closeTransferModal = () => {
  showTransferModal.value = false
  transferringTicketId.value = null
  transferTargetUserId.value = null
}

const transferTicket = async () => {
  if (!transferringTicketId.value || !transferTargetUserId.value) {
    toast.warning('Selecione um colaborador para transferência')
    return
  }

  try {
    const { data } = await api.post(`/tickets/${transferringTicketId.value}/transfer`, {
      user_id: transferTargetUserId.value,
      status: 'pending',
    })

    const index = tickets.value.findIndex((t) => t.id === transferringTicketId.value)
    if (index !== -1) {
      tickets.value[index] = data
    }

    toast.success('Atendimento transferido com sucesso')
    closeTransferModal()

    if (selectedTicketId.value === transferringTicketId.value) {
      selectedTicketId.value = null
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao transferir atendimento'
    toast.error(message)
  }
}

const updateTicketStatus = async (ticketId: number, status: Ticket['status']) => {
  try {
    const { data } = await api.patch(`/tickets/${ticketId}`, { status })
    const index = tickets.value.findIndex((t) => t.id === ticketId)
    if (index !== -1) {
      tickets.value[index] = data
    }
    toast.success('Status atualizado')
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar status'
    toast.error(message)
  }
}

// ═══════════════════════════════════════════════════════════════
// Lifecycle
// ═══════════════════════════════════════════════════════════════

onMounted(async () => {
  await Promise.all([loadTickets(), loadTemplates(), loadUsers()])
})
</script>

<template>
  <div class="flex h-full gap-4 p-6">
    <!-- Lista de Conversas -->
    <div class="flex w-full max-w-xs flex-col gap-4">
      <div class="flex flex-col gap-2">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white">Fila de Atendimento</h2>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por número, nome..."
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div v-if="loading" class="flex justify-center py-8">
        <div class="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
      </div>

      <div v-else class="flex flex-1 flex-col gap-2 overflow-y-auto">
        <div
          v-for="ticket in filteredTickets"
          :key="ticket.id"
          :class="[
            'cursor-pointer rounded-lg border-2 p-3 transition-all',
            selectedTicketId === ticket.id
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-950'
              : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600',
          ]"
          @click="selectTicket(ticket.id)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex-1">
              <div class="font-semibold text-slate-900 dark:text-white">{{ ticket.contact_name || ticket.contact_phone }}</div>
              <div class="text-xs text-slate-600 dark:text-slate-400">{{ ticket.contact_phone }}</div>
            </div>
            <span :class="['rounded px-2 py-1 text-xs font-semibold', statusClass[ticket.status]]">
              {{ statusLabel[ticket.status] }}
            </span>
          </div>

          <div class="mt-2 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span v-if="ticket.instance" class="flex items-center gap-1">
              <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"
                />
              </svg>
              {{ ticket.instance.name }}
            </span>
            <span :class="priorityClass[ticket.priority]">{{ priorityLabel[ticket.priority] }}</span>
          </div>
        </div>

        <div v-if="filteredTickets.length === 0" class="flex flex-1 items-center justify-center">
          <p class="text-slate-600 dark:text-slate-400">Nenhuma conversa encontrada</p>
        </div>
      </div>
    </div>

    <!-- Detalhes do Atendimento -->
    <div class="flex flex-1 flex-col gap-4">
      <div v-if="!selectedTicket" class="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700">
        <p class="text-slate-600 dark:text-slate-400">Selecione uma conversa para iniciar</p>
      </div>

      <div v-else class="flex flex-1 flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <!-- Cabeçalho do Ticket -->
        <div class="flex items-start justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
          <div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ selectedTicket.contact_name || selectedTicket.contact_phone }}</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ selectedTicket.contact_phone }}</p>
            <div v-if="selectedTicket.agent" class="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Atendido por: <span class="font-semibold">{{ selectedTicket.agent.name }}</span>
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <button
              @click="openTransferModal(selectedTicket.id)"
              class="rounded-lg bg-orange-100 px-3 py-2 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:hover:bg-orange-800"
            >
              📤 Transferir
            </button>

            <select
              :value="selectedTicket.status"
              @change="(e) => updateTicketStatus(selectedTicket.id, (e.target as HTMLSelectElement).value as Ticket['status'])"
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            >
              <option v-for="[key, label] in Object.entries(statusLabel)" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>
        </div>

        <!-- Mensagens -->
        <div
          v-if="messagesLoadingByTicketId[selectedTicket.id]"
          class="flex flex-1 items-center justify-center py-8"
        >
          <div class="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
        </div>

        <div v-else class="flex flex-1 flex-col overflow-hidden">
          <div class="flex-1 space-y-3 overflow-y-auto">
            <div
              v-for="msg in selectedTicketMessages"
              :key="msg.id"
              :class="[
                'flex gap-2',
                msg.direction === 'outbound' ? 'justify-end' : 'justify-start',
              ]"
            >
              <div
                :class="[
                  'max-w-xs rounded-lg px-3 py-2 text-sm',
                  msg.direction === 'outbound'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-white',
                ]"
              >
                {{ msg.content }}
              </div>
              <div class="text-xs text-slate-500 dark:text-slate-400">
                {{ dayjs(msg.created_at).format('HH:mm') }}
              </div>
            </div>
          </div>

          <!-- Entrada para Nova Mensagem -->
          <div class="flex flex-col gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
            <!-- Botão de Templates -->
            <button
              @click="showTemplateModal = true"
              class="rounded-lg border border-slate-300 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              📋 Templates
            </button>

            <!-- Campo de Digitação -->
            <div class="flex gap-2">
              <textarea
                v-model="messageDraftByTicketId[selectedTicket.id]"
                placeholder="Digite sua mensagem..."
                class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
                rows="2"
              ></textarea>
              <button
                @click="sendMessage(selectedTicket.id)"
                :disabled="sendingMessageByTicketId[selectedTicket.id]"
                class="rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-600 disabled:bg-slate-400 dark:hover:bg-blue-600"
              >
                <span v-if="!sendingMessageByTicketId[selectedTicket.id]">Enviar</span>
                <div v-else class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Templates -->
    <div
      v-if="showTemplateModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showTemplateModal = false"
    >
      <div class="max-h-96 w-96 rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Mensagens Padrão</h3>
          <button
            @click="showTemplateModal = false"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <div class="flex flex-col gap-4 overflow-y-auto">
          <div v-for="(categoryTemplates, category) in templatesByCategory" :key="category" class="flex flex-col gap-2">
            <h4 class="font-semibold text-slate-700 dark:text-slate-300">{{ categoryLabel[category] || category }}</h4>

            <button
              v-for="template in categoryTemplates"
              :key="template.id"
              @click="applyTemplate(template.id)"
              class="rounded-lg border border-slate-300 bg-slate-50 p-3 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
            >
              <div class="font-semibold">{{ template.name }}</div>
              <div class="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">{{ template.content }}</div>
            </button>
          </div>

          <div v-if="templates.length === 0" class="flex flex-1 items-center justify-center py-8">
            <p class="text-slate-600 dark:text-slate-400">Nenhum template disponível</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Transferência -->
    <div
      v-if="showTransferModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="closeTransferModal"
    >
      <div class="w-96 rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">Transferir Atendimento</h3>
          <button
            @click="closeTransferModal"
            class="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <div class="mb-6 flex flex-col gap-2">
          <label class="text-sm font-semibold text-slate-700 dark:text-slate-300">Transferir para</label>
          <select
            v-model.number="transferTargetUserId"
            class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option :value="null">-- Selecione um colaborador --</option>
            <option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.email }})
            </option>
          </select>
        </div>

        <div class="flex gap-2">
          <button
            @click="closeTransferModal"
            class="flex-1 rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            @click="transferTicket"
            class="flex-1 rounded-lg bg-orange-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-orange-600"
          >
            Transferir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar customizado */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
