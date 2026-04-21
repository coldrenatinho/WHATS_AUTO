import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import vuetify from 'vite-plugin-vuetify'
import { transformAssetUrls } from 'vuetify/lib/utilities'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue({ template: { transformAssetUrls } }), tailwindcss(), vuetify({ autoImport: true })],
})
