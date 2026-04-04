<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import api from '../services/api'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'manager' | 'agent' | 'viewer'
  is_active: boolean
}

const users = ref<User[]>([])
const loading = ref(true)
const isSaving = ref(false)
const error = ref('')
const success = ref('')
const searchQuery = ref('')

const form = ref({
  name: '',
  email: '',
  password: '',
  role: 'agent' as User['role'],
})

const roleLabels: Record<User['role'], string> = {
  admin: 'Admin',
  manager: 'Gestor',
  agent: 'Agente',
  viewer: 'Leitura',
}

const filteredUsers = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()

  if (!term) return users.value

  return users.value.filter((user) => {
    return [user.name, user.email, roleLabels[user.role]].some((field) => field.toLowerCase().includes(term))
  })
})

const stats = computed(() => {
  const total = users.value.length
  const active = users.value.filter((user) => user.is_active).length
  const inactive = total - active
  const admins = users.value.filter((user) => user.role === 'admin').length

  return { total, active, inactive, admins }
})

const loadUsers = async () => {
  loading.value = true
  error.value = ''

  try {
    const { data } = await api.get('/users')
    users.value = data
  } catch {
    error.value = 'Não foi possível carregar os usuários no momento.'
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  if (!form.value.name || !form.value.email || !form.value.password) {
    error.value = 'Preencha nome, email e senha para cadastrar o usuário.'
    return
  }

  isSaving.value = true
  error.value = ''
  success.value = ''

  try {
    await api.post('/users', form.value)
    form.value = { name: '', email: '', password: '', role: 'agent' }
    success.value = 'Usuário cadastrado com sucesso.'
    await loadUsers()
  } catch {
    error.value = 'Não foi possível cadastrar o usuário.'
  } finally {
    isSaving.value = false
  }
}

const toggleUser = async (user: User) => {
  isSaving.value = true
  error.value = ''
  success.value = ''

  try {
    await api.patch(`/users/${user.id}`, { is_active: !user.is_active })
    success.value = user.is_active ? 'Usuário desativado.' : 'Usuário ativado.'
    await loadUsers()
  } catch {
    error.value = 'Não foi possível atualizar este usuário.'
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  await loadUsers()
})
</script>

<template>
  <div class="space-y-6 animate-fade-in">
    <div class="grid gap-4 xl:grid-cols-[1.08fr_0.92fr]">
      <section class="rounded-[2rem] border border-slate-200/70 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-slate-100 shadow-[0_24px_80px_rgba(15,23,42,0.18)] dark:border-slate-800">
        <p class="text-xs uppercase tracking-[0.18em] text-emerald-300/85">Admin • Equipe e Agentes</p>
        <h1 class="mt-3 text-3xl font-bold tracking-tight">Gerencie o acesso da operação com clareza.</h1>
        <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
          Cadastre novos usuários, controle papéis e altere o status de acesso sem perder a leitura da operação.
        </p>

        <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
            <p class="text-xs uppercase tracking-[0.14em] text-slate-300/80">Total</p>
            <p class="mt-1 text-2xl font-bold text-white">{{ stats.total }}</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
            <p class="text-xs uppercase tracking-[0.14em] text-slate-300/80">Ativos</p>
            <p class="mt-1 text-2xl font-bold text-white">{{ stats.active }}</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
            <p class="text-xs uppercase tracking-[0.14em] text-slate-300/80">Inativos</p>
            <p class="mt-1 text-2xl font-bold text-white">{{ stats.inactive }}</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
            <p class="text-xs uppercase tracking-[0.14em] text-slate-300/80">Admins</p>
            <p class="mt-1 text-2xl font-bold text-white">{{ stats.admins }}</p>
          </div>
        </div>
      </section>

      <section class="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/88">
        <p class="text-xs uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">Novo usuário</p>
        <h2 class="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Cadastrar acesso</h2>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">Preencha os dados do usuário e escolha o nível de acesso.</p>

        <div v-if="error" class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/80 dark:bg-rose-900/25 dark:text-rose-300">
          {{ error }}
        </div>

        <div v-if="success" class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800/80 dark:bg-emerald-900/25 dark:text-emerald-300">
          {{ success }}
        </div>

        <form class="mt-5 space-y-4" @submit.prevent="createUser">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="space-y-1.5 sm:col-span-2">
              <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome</span>
              <input v-model="form.name" class="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40" placeholder="Nome completo" />
            </label>

            <label class="space-y-1.5 sm:col-span-2">
              <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</span>
              <input v-model="form.email" class="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40" placeholder="usuario@empresa.com" />
            </label>

            <label class="space-y-1.5">
              <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">Senha</span>
              <input v-model="form.password" type="password" class="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40" placeholder="Senha inicial" />
            </label>

            <label class="space-y-1.5">
              <span class="block text-sm font-medium text-slate-700 dark:text-slate-300">Perfil</span>
              <select v-model="form.role" class="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40">
                <option value="agent">Agente</option>
                <option value="manager">Gestor</option>
                <option value="viewer">Leitura</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>

          <button
            type="submit"
            :disabled="isSaving"
            class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-700 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg v-if="isSaving" class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ isSaving ? 'Salvando...' : 'Cadastrar usuário' }}
          </button>
        </form>
      </section>
    </div>

    <section class="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/88">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Base de acesso</p>
          <h2 class="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Usuários cadastrados</h2>
        </div>

        <label class="relative block w-full max-w-md">
          <span class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input v-model="searchQuery" type="text" class="w-full rounded-2xl border border-slate-300/80 bg-white py-3 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40" placeholder="Buscar por nome, email ou perfil" />
        </label>
      </div>

      <div v-if="loading" class="mt-5 rounded-2xl border border-dashed border-slate-300/70 bg-slate-50 px-4 py-8 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
        Carregando usuários...
      </div>

      <div v-else class="mt-5 space-y-4">
        <div v-if="filteredUsers.length === 0" class="rounded-2xl border border-dashed border-slate-300/70 bg-slate-50 px-4 py-8 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
          Nenhum usuário encontrado com o filtro atual.
        </div>

        <article
          v-for="user in filteredUsers"
          :key="user.id"
          class="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-4 transition hover:border-emerald-200 hover:bg-white dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-emerald-700/50 dark:hover:bg-slate-800 md:flex-row md:items-center md:justify-between"
        >
          <div class="flex items-start gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-semibold text-white shadow-sm shadow-emerald-500/20">
              {{ user.name.charAt(0).toUpperCase() }}
            </div>

            <div>
              <div class="flex flex-wrap items-center gap-2">
                <p class="font-semibold text-slate-900 dark:text-white">{{ user.name }}</p>
                <span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="user.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'">
                  {{ user.is_active ? 'Ativo' : 'Inativo' }}
                </span>
                <span class="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                  {{ roleLabels[user.role] }}
                </span>
              </div>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">{{ user.email }}</p>
            </div>
          </div>

          <button
            class="rounded-2xl border border-slate-300/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700"
            :disabled="isSaving"
            @click="toggleUser(user)"
          >
            {{ user.is_active ? 'Desativar' : 'Ativar' }}
          </button>
        </article>
      </div>
    </section>
  </div>
</template>
