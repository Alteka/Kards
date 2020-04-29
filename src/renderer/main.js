import Vue from 'vue'

import App from './App'
import router from './router'

import ElementUI from 'element-ui'
import './theme/index.css'
import locale from 'element-ui/lib/locale/lang/en'

import '@fortawesome/fontawesome-free/css/all.css'

import 'vue-resize/dist/vue-resize.css'
import VueResize from 'vue-resize'
Vue.use(VueResize)

import VueResizeText from 'vue-resize-text'
Vue.use(VueResizeText)

Vue.use(ElementUI, {locale})

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>',
  mounted: function() {
    var webFrame = require('electron').webFrame;
    webFrame.setVisualZoomLevelLimits(1, 1);
    webFrame.setLayoutZoomLevelLimits(0, 0);
    webFrame.setZoomFactor(1.0)
  }
}).$mount('#app')
