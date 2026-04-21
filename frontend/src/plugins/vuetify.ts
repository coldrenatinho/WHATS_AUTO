import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'norteMtLight',
    themes: {
      norteMtLight: {
        dark: false,
        colors: {
          primary: '#0f766e',
          secondary: '#fb923c',
          surface: '#ffffff',
          background: '#f8fafc',
          success: '#16a34a',
          warning: '#d97706',
          error: '#dc2626',
          info: '#0284c7',
        },
      },
      norteMtDark: {
        dark: true,
        colors: {
          primary: '#2dd4bf',
          secondary: '#fb923c',
          surface: '#0f172a',
          background: '#020617',
          success: '#22c55e',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#38bdf8',
        },
      },
    },
  },
})

export default vuetify
