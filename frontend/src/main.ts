import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { connectSocket, disconnectSocket } from './services/socket'
import 'vue3-toastify/dist/index.css'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')

connectSocket()
window.addEventListener('beforeunload', () => {
	disconnectSocket()
})
