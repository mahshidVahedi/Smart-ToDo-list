import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { initGoogleSync } from './sync/GoogleSync'
const app = createApp(App)       
const pinia = createPinia()


app.use(pinia)
initGoogleSync()
app.mount('#app')
