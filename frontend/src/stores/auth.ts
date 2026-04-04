import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

interface User {
  id: number
  name: string
  email: string
  role: string
  avatar?: string
}

interface Company {
  id: number
  name: string
  subdomain: string
  plan: string
  status: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const company = ref<Company | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => !!token.value)

  async function login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password })
      const data = response.data

      user.value = data.user
      company.value = data.company
      token.value = data.token

      localStorage.setItem('token', data.token)
      api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`

      return { success: true }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } }
      return { 
        success: false, 
        error: err.response?.data?.error || 'Erro ao fazer login' 
      }
    }
  }

  async function register(data: {
    name: string
    email: string
    password: string
    companyName: string
    subdomain: string
    phone?: string
  }) {
    try {
      const response = await api.post('/auth/register', data)
      const resData = response.data

      user.value = resData.user
      company.value = resData.company
      token.value = resData.token

      localStorage.setItem('token', resData.token)
      api.defaults.headers.common['Authorization'] = `Bearer ${resData.token}`

      return { success: true }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } }
      return { 
        success: false, 
        error: err.response?.data?.error || 'Erro ao criar conta' 
      }
    }
  }

  async function fetchUser() {
    if (!token.value) return

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
      const response = await api.get('/auth/me')
      
      user.value = response.data.user
      company.value = response.data.company
    } catch (error) {
      logout()
    }
  }

  function logout() {
    user.value = null
    company.value = null
    token.value = null
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }

  return {
    user,
    company,
    token,
    isAuthenticated,
    login,
    register,
    fetchUser,
    logout
  }
})