import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import './firebase/config'
import { i18n } from './locale'
import { Notivue } from 'notivue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(i18n)
app.component('Notivue', Notivue)
app.mount('#app')