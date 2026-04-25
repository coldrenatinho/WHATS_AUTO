<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
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

  try {
    const result = await authStore.login(email.value, password.value)

    if (result.success) {
      await router.replace('/')
      return
    }

    error.value = result.error || 'Erro ao fazer login'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  // Easter egg or dynamic background setup if needed
})
</script>

<template>
  <v-container class="login-container d-flex align-center justify-center py-8" fluid>
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>
    
    <v-row class="w-100 position-relative z-10" justify="center">
      <v-col cols="12" sm="10" md="8" lg="9" xl="7">
        <v-card class="glass-card overflow-hidden" rounded="xl" elevation="0">
          <v-row no-gutters class="h-100">
            <!-- Coluna da Marca (Esquerda) -->
            <v-col class="brand-panel d-none d-lg-flex flex-column justify-space-between pa-10" cols="12" lg="6">
              <div class="brand-overlay"></div>
              <div class="position-relative z-10">
                <v-chip color="white" size="small" class="brand-chip" variant="outlined">Norte MT Sistemas</v-chip>
                <h1 class="text-h3 font-weight-bold mt-8 mb-4 text-white line-height-tight">
                  Sua operação em <span class="text-gradient-accent">alta performance.</span>
                </h1>
                <p class="text-h6 text-white opacity-80 font-weight-regular">
                  Centralize o atendimento, automatize fluxos e traga clareza para a sua equipe em tempo real.
                </p>
              </div>
              
              <div class="position-relative z-10 d-flex gap-6 mt-8">
                <div class="stat-item">
                  <div class="stat-value text-h5 font-weight-bold text-white">99.9%</div>
                  <div class="stat-label text-caption text-uppercase tracking-wide opacity-70 text-white">Uptime</div>
                </div>
                <div class="stat-divider"></div>
                <div class="stat-item">
                  <div class="stat-value text-h5 font-weight-bold text-white">10x</div>
                  <div class="stat-label text-caption text-uppercase tracking-wide opacity-70 text-white">Mais Rápido</div>
                </div>
              </div>
            </v-col>

            <!-- Coluna de Login (Direita) -->
            <v-col cols="12" lg="6" class="login-panel bg-surface pa-8 pa-md-12 d-flex flex-column justify-center">
              <div class="mb-8">
                <v-avatar color="primary" size="48" class="mb-4 elevation-2"><span class="font-weight-bold text-white">NM</span></v-avatar>
                <h2 class="text-h4 font-weight-bold text-text mb-2">Bem-vindo de volta</h2>
                <p class="text-body-1 text-text-muted">Acesse a sua plataforma Norte MT.</p>
              </div>

              <v-alert v-if="error" class="mb-6 rounded-lg" density="comfortable" type="error" variant="tonal" icon="mdi-alert-circle-outline">
                {{ error }}
              </v-alert>

              <v-form @submit.prevent="handleLogin" class="login-form">
                <v-text-field
                  v-model="email"
                  autocomplete="email"
                  class="mb-4"
                  label="Email corporativo"
                  placeholder="voce@empresa.com"
                  prepend-inner-icon="mdi-email-outline"
                  required
                  type="email"
                  variant="outlined"
                  bg-color="transparent"
                  hide-details="auto"
                  color="primary"
                />

                <v-text-field
                  v-model="password"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  class="mb-6"
                  label="Senha de acesso"
                  prepend-inner-icon="mdi-lock-outline"
                  required
                  variant="outlined"
                  bg-color="transparent"
                  hide-details="auto"
                  color="primary"
                  @click:append-inner="showPassword = !showPassword"
                />

                <v-btn 
                  block 
                  class="submit-btn text-none font-weight-bold" 
                  color="primary" 
                  :disabled="!canSubmit" 
                  size="x-large" 
                  type="submit" 
                  elevation="2"
                >
                  <v-progress-circular v-if="isLoading" class="mr-2" indeterminate size="20" width="2" color="white" />
                  {{ isLoading ? 'Validando...' : 'Entrar na Plataforma' }}
                </v-btn>
              </v-form>
              
              <div class="mt-8 text-center">
                <p class="text-caption text-text-muted">
                  Protegido por criptografia end-to-end. <br/> Norte MT Sistemas &copy; 2026.
                </p>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: var(--color-bg);
}

.blob {
  position: absolute;
  filter: blur(80px);
  z-index: 0;
  border-radius: 50%;
  animation: float 20s infinite ease-in-out alternate;
  opacity: 0.6;
}

.blob-1 {
  width: 500px;
  height: 500px;
  background: rgba(16, 185, 129, 0.3); /* Primary */
  top: -100px;
  left: -100px;
}

.blob-2 {
  width: 400px;
  height: 400px;
  background: rgba(251, 146, 60, 0.2); /* Accent */
  bottom: -50px;
  right: -50px;
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(50px, 30px) scale(1.1); }
  100% { transform: translate(-30px, 60px) scale(0.9); }
}

.glass-card {
  background: rgba(var(--v-theme-surface), 0.7) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
  min-height: 600px;
}

.brand-panel {
  position: relative;
  background: linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%);
  overflow: hidden;
}

.brand-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPgo8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiLz4KPC9zdmc+') repeat;
  opacity: 0.5;
  z-index: 1;
}

.text-gradient-accent {
  background: linear-gradient(to right, #fb923c, #fde68a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.line-height-tight {
  line-height: 1.1;
}

.stat-divider {
  width: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 0 1rem;
}

.login-form :deep(.v-field) {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.login-form :deep(.v-field--focused) {
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
}

.submit-btn {
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -10px rgba(16, 185, 129, 0.5) !important;
}

html.dark .glass-card {
  background: rgba(16, 29, 26, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

html.dark .login-panel {
  background-color: transparent !important;
}
</style>
