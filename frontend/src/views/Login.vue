<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')
const showPassword = ref(false)

const canSubmit = computed(() => {
  return email.value.trim().length > 0 && password.value.trim().length > 0 && !isLoading.value
})

const handleLogin = async () => {
  if (!canSubmit.value) return

  isLoading.value = true
  error.value = ''

  const result = await authStore.login(email.value, password.value)

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.error || 'Erro ao fazer login'
  }

  isLoading.value = false
}
</script>

<template>
  <v-container class="d-flex align-center justify-center py-8" fluid style="min-height: 100vh;">
    <v-row class="w-100" justify="center">
      <v-col cols="12" lg="10" xl="9">
        <v-card class="overflow-hidden" rounded="xl">
          <v-row no-gutters>
            <v-col class="d-none d-lg-flex flex-column justify-space-between pa-10" cols="12" lg="7" style="background: linear-gradient(160deg, rgba(6,95,70,0.98), rgba(5,150,105,0.92) 58%, rgba(16,185,129,0.88)); color: #ecfdf5;">
              <div>
                <v-chip color="white" size="small" variant="outlined">Norte MT Sistemas</v-chip>
                <h1 class="text-h4 font-weight-bold mt-8">Atendimento WhatsApp com ritmo de operação.</h1>
                <p class="mt-4 text-body-2">Centralize conversas, automações e time em uma experiência única e rápida.</p>
              </div>
              <v-row>
                <v-col cols="4"><div class="text-caption">Conversas</div><div class="text-h6 font-weight-bold">+1.2k</div></v-col>
                <v-col cols="4"><div class="text-caption">SLA médio</div><div class="text-h6 font-weight-bold">04m</div></v-col>
                <v-col cols="4"><div class="text-caption">Equipe</div><div class="text-h6 font-weight-bold">18</div></v-col>
              </v-row>
            </v-col>

            <v-col cols="12" lg="5">
              <v-card-text class="pa-6 pa-md-8">
                <div class="d-flex align-center mb-6">
                  <v-avatar color="primary" size="42" class="mr-3"><span class="font-weight-bold">NM</span></v-avatar>
                  <div>
                    <h2 class="text-h5 font-weight-bold">Entrar na plataforma</h2>
                    <p class="text-body-2 text-medium-emphasis">Acesse sua operação em tempo real.</p>
                  </div>
                </div>

                <v-alert v-if="error" class="mb-4" density="comfortable" type="error" variant="tonal">{{ error }}</v-alert>

                <v-form @submit.prevent="handleLogin">
                  <v-text-field
                    v-model="email"
                    autocomplete="email"
                    class="mb-3"
                    label="Email"
                    placeholder="seu@email.com"
                    prepend-inner-icon="mdi-email-outline"
                    required
                    type="email"
                    variant="outlined"
                  />

                  <v-text-field
                    v-model="password"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    :type="showPassword ? 'text' : 'password'"
                    autocomplete="current-password"
                    label="Senha"
                    prepend-inner-icon="mdi-lock-outline"
                    required
                    variant="outlined"
                    @click:append-inner="showPassword = !showPassword"
                  />

                  <v-btn block class="mt-4" color="primary" :disabled="!canSubmit" size="large" type="submit" variant="flat">
                    <v-progress-circular v-if="isLoading" class="mr-2" indeterminate size="18" width="2" />
                    {{ isLoading ? 'Validando acesso...' : 'Entrar agora' }}
                  </v-btn>
                </v-form>
              </v-card-text>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>