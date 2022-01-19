import { createRouter, createWebHashHistory } from 'vue-router'
import Control from '../views/Control.vue'
import Testcard from '../views/Testcard.vue'

const routes = [
  {
    path: '/',
    name: 'control',
    component: Control
  },
  {
    path: '/testcard',
    name: 'Testcard',
    component: Testcard
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
