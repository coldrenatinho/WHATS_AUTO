<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import WorkflowBuilder from '../components/workflow/WorkflowBuilder.vue'
import { EMPTY_WORKFLOW_MODEL, type WorkflowModel } from '../components/workflow/types'

interface Flow {
  id: number
  name: string
  description?: string
  trigger_type: 'keyword' | 'greeting' | 'menu' | 'webhook' | 'schedule'
  is_active: boolean
  trigger_config?: Record<string, unknown>
  settings?: {
    sector?: string
    assignedAgentIds?: number[]
  }
}

interface User {
  id: number
  name: string
  role: string
}

const authStore = useAuthStore()
const flows = ref<Flow[]>([])
const agents = ref<User[]>([])
const loading = ref(true)
const savingWorkspace = ref(false)
const workspaceNotice = ref('')
const selectedFlowId = ref<number | null>(null)
const workspaceDraft = ref<WorkflowModel>({ ...EMPTY_WORKFLOW_MODEL })

const canManage = computed(() => ['admin', 'manager'].includes(authStore.user?.role || ''))

const form = ref({
  name: '',
  description: '',
  trigger_type: 'keyword' as Flow['trigger_type'],
  sector: 'Geral',
  assignedAgentIds: [] as number[],
})

const isWorkflowModel = (value: unknown): value is WorkflowModel => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const model = value as { nodes?: unknown; connections?: unknown }
  return Array.isArray(model.nodes) && Array.isArray(model.connections)
}

const normalizeWorkflowModel = (value: unknown): WorkflowModel => {
  if (!isWorkflowModel(value)) {
    return { ...EMPTY_WORKFLOW_MODEL }
  }

  return {
    nodes: modelNodes(value.nodes),
    connections: modelConnections(value.connections),
  }
}

const modelNodes = (nodes: unknown[]): WorkflowModel['nodes'] => {
  return nodes
    .map((node) => {
      if (!node || typeof node !== 'object') {
        return null
      }

      const data = node as { id?: unknown; type?: unknown; label?: unknown; x?: unknown; y?: unknown }
      if (
        typeof data.id !== 'string' ||
        typeof data.type !== 'string' ||
        typeof data.label !== 'string' ||
        typeof data.x !== 'number' ||
        typeof data.y !== 'number'
      ) {
        return null
      }

      return {
        id: data.id,
        type: data.type,
        label: data.label,
        x: data.x,
        y: data.y,
      }
    })
    .filter((node): node is WorkflowModel['nodes'][number] => Boolean(node))
}

const modelConnections = (connections: unknown[]): WorkflowModel['connections'] => {
  return connections
    .map((connection) => {
      if (!connection || typeof connection !== 'object') {
        return null
      }

      const data = connection as { id?: unknown; fromNodeId?: unknown; toNodeId?: unknown }
      if (typeof data.id !== 'string' || typeof data.fromNodeId !== 'string' || typeof data.toNodeId !== 'string') {
        return null
      }

      return {
        id: data.id,
        fromNodeId: data.fromNodeId,
        toNodeId: data.toNodeId,
      }
    })
    .filter((connection): connection is WorkflowModel['connections'][number] => Boolean(connection))
}

const loadWorkspaceFromFlow = (flow: Flow | undefined) => {
  const rawConfig = flow?.trigger_config
  if (!rawConfig) {
    workspaceDraft.value = { ...EMPTY_WORKFLOW_MODEL }
    return
  }

  const config = rawConfig as { workspaceModel?: unknown }
  const model = config.workspaceModel ?? rawConfig
  workspaceDraft.value = normalizeWorkflowModel(model)
}

const selectedFlow = computed(() => {
  if (!selectedFlowId.value) {
    return null
  }

  return flows.value.find((flow) => flow.id === selectedFlowId.value) || null
})

const loadData = async () => {
  try {
    const [flowsResp, usersResp] = await Promise.all([
      api.get('/flows'),
      api.get('/users').catch(() => ({ data: [] })),
    ])

    flows.value = flowsResp.data
    agents.value = (usersResp.data || []).filter((user: User) => ['agent', 'manager'].includes(user.role))

    if (!selectedFlowId.value && flows.value.length > 0) {
      selectedFlowId.value = flows.value[0].id
      loadWorkspaceFromFlow(flows.value[0])
    }

    if (selectedFlowId.value) {
      loadWorkspaceFromFlow(flows.value.find((flow) => flow.id === selectedFlowId.value))
    }
  } finally {
    loading.value = false
  }
}

const createFlow = async () => {
  if (!form.value.name) {
    return
  }

  await api.post('/flows', form.value)
  form.value = {
    name: '',
    description: '',
    trigger_type: 'keyword',
    sector: 'Geral',
    assignedAgentIds: [],
  }

  await loadData()
}

const toggleFlow = async (flow: Flow) => {
  await api.patch(`/flows/${flow.id}`, { is_active: !flow.is_active })
  await loadData()
}

const selectFlowWorkspace = (flowId: number) => {
  selectedFlowId.value = flowId
  loadWorkspaceFromFlow(flows.value.find((flow) => flow.id === flowId))
  workspaceNotice.value = ''
}

const saveWorkspace = async () => {
  if (!selectedFlow.value || !canManage.value) {
    return
  }

  savingWorkspace.value = true
  workspaceNotice.value = ''

  try {
    const existingConfig = (selectedFlow.value.trigger_config || {}) as Record<string, unknown>

    await api.patch(`/flows/${selectedFlow.value.id}`, {
      trigger_config: {
        ...existingConfig,
        workspaceModel: workspaceDraft.value,
      },
    })

    workspaceNotice.value = 'Modelo visual salvo com sucesso.'
    await loadData()
  } catch {
    workspaceNotice.value = 'Nao foi possivel salvar o modelo visual.'
  } finally {
    savingWorkspace.value = false
  }
}

onMounted(async () => {
  await loadData()
})
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Automacoes</h1>
      <p class="mt-2 text-gray-600 dark:text-gray-400">
        Central de fluxos para chatbot, n8n e webhooks.
      </p>
    </div>

    <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-sm text-gray-500 dark:text-gray-400">Fluxos ativos</p>
        <p class="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{{ flows.filter((f) => f.is_active).length }}</p>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-sm text-gray-500 dark:text-gray-400">Total de fluxos</p>
        <p class="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{{ flows.length }}</p>
      </div>

      <div class="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <p class="text-sm text-gray-500 dark:text-gray-400">Setores mapeados</p>
        <p class="mt-1 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{{ new Set(flows.map((f) => f.settings?.sector || 'Geral')).size }}</p>
      </div>
    </div>

    <div v-if="canManage" class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Criar fluxo por setor e agente</h2>
      <div class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <input v-model="form.name" class="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" placeholder="Nome do fluxo" />
        <input v-model="form.sector" class="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900" placeholder="Setor (ex: Vendas, Suporte)" />
        <textarea v-model="form.description" class="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900 md:col-span-2" rows="3" placeholder="Descrição" />
        <select v-model="form.trigger_type" class="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
          <option value="keyword">Keyword</option>
          <option value="greeting">Saudação</option>
          <option value="menu">Menu</option>
          <option value="webhook">Webhook</option>
          <option value="schedule">Agendado</option>
        </select>
        <select v-model="form.assignedAgentIds" multiple class="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900">
          <option v-for="agent in agents" :key="agent.id" :value="agent.id">{{ agent.name }}</option>
        </select>
      </div>
      <button class="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700" @click="createFlow">
        Salvar fluxo
      </button>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Workspace de workflow (arrastar e soltar)</h2>
          <p class="text-xs text-gray-500 dark:text-gray-400">Monte o fluxo visual de cada automacao por espaco de trabalho.</p>
        </div>
        <div class="flex items-center gap-2">
          <select
            :value="selectedFlowId || ''"
            class="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-900"
            @change="selectFlowWorkspace(Number(($event.target as HTMLSelectElement).value))"
          >
            <option disabled value="">Selecione um fluxo</option>
            <option v-for="flow in flows" :key="flow.id" :value="flow.id">
              {{ flow.name }}
            </option>
          </select>

          <button
            v-if="canManage"
            class="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            :disabled="!selectedFlow || savingWorkspace"
            @click="saveWorkspace"
          >
            {{ savingWorkspace ? 'Salvando...' : 'Salvar modelo' }}
          </button>
        </div>
      </div>

      <p v-if="workspaceNotice" class="mt-3 text-xs" :class="workspaceNotice.includes('sucesso') ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600 dark:text-rose-300'">
        {{ workspaceNotice }}
      </p>

      <div class="mt-4">
        <WorkflowBuilder v-model="workspaceDraft" />
      </div>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Fluxos cadastrados</h2>
      <div v-if="loading" class="mt-4 text-sm text-gray-600 dark:text-gray-300">Carregando fluxos...</div>
      <div v-else class="mt-4 space-y-3">
        <div v-if="flows.length === 0" class="rounded-lg border border-dashed border-gray-300 px-4 py-5 text-sm text-gray-600 dark:border-gray-600 dark:text-gray-300">
          Nenhum fluxo cadastrado.
        </div>

        <div
          v-for="flow in flows"
          :key="flow.id"
          class="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="font-medium text-gray-900 dark:text-white">{{ flow.name }}</p>
            <p class="text-xs text-gray-600 dark:text-gray-400">
              Setor: {{ flow.settings?.sector || 'Geral' }} • Trigger: {{ flow.trigger_type }}
            </p>
          </div>
          <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="flow.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'">
            {{ flow.is_active ? 'Ativo' : 'Inativo' }}
          </span>
          <button v-if="canManage" class="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800" @click="toggleFlow(flow)">
            Alternar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
