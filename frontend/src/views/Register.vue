<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  companyName: '',
  subdomain: '',
  phone: '',
})

const isLoading = ref(false)
const error = ref('')

const handleRegister = async () => {
  if (form.value.password !== form.value.confirmPassword) {
    error.value = 'As senhas não coincidem'
    return
  }

  isLoading.value = true
  error.value = ''

  const result = await authStore.register({
    name: form.value.name,
    email: form.value.email,
    password: form.value.password,
    companyName: form.value.companyName,
    subdomain: form.value.subdomain,
    phone: form.value.phone,
  })

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Erro ao criar conta'
  }

  isLoading.value = false
}
</script>

<template>
  <div class="relative min-h-screen overflow-hidden px-4 py-8 sm:px-6 lg:px-10">
    <div class="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-emerald-400/30 blur-3xl"></div>
    <div class="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-orange-300/24 blur-3xl"></div>

    <div class="relative mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section class="hidden min-h-[calc(100vh-4rem)] rounded-[2rem] border border-emerald-200/60 bg-[linear-gradient(160deg,rgba(11,18,32,0.98),rgba(15,23,42,0.95)_55%,rgba(16,185,129,0.72))] p-10 text-slate-50 shadow-2xl shadow-slate-950/25 lg:flex lg:flex-col lg:justify-between">
        <div>
          <span class="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-100/90">
            Comece em poucos minutos
          </span>
          <h1 class="mt-8 max-w-xl text-4xl font-bold leading-tight tracking-tight">
            Uma conta, sua operação, seu time e seu subdomínio.
          </h1>
          <p class="mt-5 max-w-lg text-sm leading-6 text-slate-200/85">
            Estruture a operação de atendimento com onboarding simples, acesso por papel e visão clara do que sua equipe precisa fazer.
          </p>
        </div>

        <div class="space-y-3">
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
            <p class="text-sm font-semibold text-white">1. Crie a empresa</p>
            <p class="mt-1 text-sm text-slate-200/80">Defina o nome, o subdomínio e o primeiro contato da operação.</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
            <p class="text-sm font-semibold text-white">2. Convide o time</p>
            <p class="mt-1 text-sm text-slate-200/80">Adicione gestores e agentes com níveis de acesso adequados.</p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
            <p class="text-sm font-semibold text-white">3. Entre em operação</p>
            <p class="mt-1 text-sm text-slate-200/80">Receba conversas, configure automações e acompanhe resultados.</p>
          </div>
        </div>
      </section>

      <section class="rounded-[2rem] border border-slate-200/70 bg-white/90 p-7 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/88 dark:shadow-black/20 sm:p-8">
        <div class="mb-8">
          <div class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white shadow-lg shadow-emerald-600/25">
            NM
          </div>
          <h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Criar conta</h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">Abra sua operação com um cadastro guiado e objetivo.</p>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-5">
          <div
            v-if="error"
            class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/80 dark:bg-rose-900/25 dark:text-rose-300"
          >
            {{ error }}
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome completo</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40"
                placeholder="Seu nome"
              />
            </div>

            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40"
                placeholder="seu@email.com"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Senha</label>
              <input
                v-model="form.password"
                type="password"
                required
                class="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40"
                placeholder="••••••••"
              />
            </div>

            <div class="space-y-1.5">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirmar senha</label>
              <input
                v-model="form.confirmPassword"
                type="password"
                required
                class="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40"
                placeholder="••••••••"
              />
            </div>

            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Nome da empresa</label>
              <input
                v-model="form.companyName"
                type="text"
                required
                class="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40"
                placeholder="Sua Empresa"
              />
            </div>

            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Subdomínio</label>
              <div class="flex overflow-hidden rounded-2xl border border-slate-300/80 bg-white focus-within:border-emerald-400 focus-within:ring-4 focus-within:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:ring-emerald-900/40">
                <input
                  v-model="form.subdomain"
                  type="text"
                  required
                  class="min-w-0 flex-1 bg-transparent px-4 py-3 text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                  placeholder="suaempresa"
                />
                <span class="flex items-center border-l border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
                  .nortemtsistemas.com.br
                </span>
              </div>
            </div>

            <div class="space-y-1.5 md:col-span-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">Telefone (opcional)</label>
              <input
                v-model="form.phone"
                type="tel"
                class="w-full rounded-2xl border border-slate-300/80 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-900/40"
                placeholder="(66) 99999-9999"
              />
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-3 font-semibold text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-700 hover:to-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg v-if="isLoading" class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ isLoading ? 'Criando conta...' : 'Criar conta' }}
          </button>

          <div class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span>Já tem uma conta?</span>
            <router-link to="/login" class="font-semibold text-emerald-600 transition hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
              Fazer login
            </router-link>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>