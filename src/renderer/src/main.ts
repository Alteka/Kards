import { createApp } from 'vue'
import App from './App.vue'
import installElementPlus from './plugins/element'
import installParticles from './plugins/particles'

import '@fortawesome/fontawesome-free/css/all.css'

import 'vue3-resize/dist/vue3-resize.css'
import Vue3Resize from 'vue3-resize'
import router from './router'

const app = createApp(App).use(router)

installElementPlus(app)
installParticles(app)
app.use(Vue3Resize)

app.mount('#app')
