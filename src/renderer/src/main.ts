import { createApp } from 'vue'
import App from './App.vue'
import installElementPlus from './plugins/element'
import installParticles from './plugins/particles'
import VueResizeText from 'vue3-resize-text'

import '@fortawesome/fontawesome-free/css/all.css'

import router from './router'

const app = createApp(App).use(router)

installElementPlus(app)
installParticles(app)
app.directive('ResizeText', VueResizeText.ResizeText)

app.mount('#app')
