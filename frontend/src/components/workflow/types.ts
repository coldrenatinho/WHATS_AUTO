export type WorkflowBlockType =
  | 'start'
  | 'message'
  | 'condition'
  | 'action'
  | 'webhook'
  | 'wait'
  | 'end'

export interface WorkflowBlockDefinition {
  type: WorkflowBlockType
  label: string
  description: string
  badgeClass: string
}

export interface WorkflowNode {
  id: string
  type: WorkflowBlockType
  label: string
  x: number
  y: number
}

export interface WorkflowConnection {
  id: string
  fromNodeId: string
  toNodeId: string
}

export interface WorkflowModel {
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
}

export const WORKFLOW_BLOCKS: WorkflowBlockDefinition[] = [
  {
    type: 'start',
    label: 'Inicio',
    description: 'Ponto de entrada do fluxo',
    badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  },
  {
    type: 'message',
    label: 'Mensagem',
    description: 'Enviar mensagem para o contato',
    badgeClass: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
  },
  {
    type: 'condition',
    label: 'Condicao',
    description: 'Desvio por regra',
    badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  },
  {
    type: 'action',
    label: 'Acao',
    description: 'Atribuir agente, tag ou setor',
    badgeClass: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
  },
  {
    type: 'webhook',
    label: 'Webhook',
    description: 'Chamar sistema externo',
    badgeClass: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
  },
  {
    type: 'wait',
    label: 'Espera',
    description: 'Aguardar tempo ou evento',
    badgeClass: 'bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100',
  },
  {
    type: 'end',
    label: 'Fim',
    description: 'Encerrar fluxo',
    badgeClass: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  },
]

export const EMPTY_WORKFLOW_MODEL: WorkflowModel = {
  nodes: [],
  connections: [],
}

const fallbackId = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`

export const generateNodeId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return fallbackId()
}

export const createNodeFromType = (type: WorkflowBlockType, x: number, y: number): WorkflowNode => {
  const definition = WORKFLOW_BLOCKS.find((block) => block.type === type)

  return {
    id: generateNodeId(),
    type,
    label: definition?.label || 'Bloco',
    x,
    y,
  }
}
