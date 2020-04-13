import Vue from 'vue'

import App from './App'
import router from './router'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en'

import VueResizeText from 'vue-resize-text'
Vue.use(VueResizeText)

Vue.use(ElementUI, {locale})

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')
