import { createRouter, createWebHashHistory } from 'vue-router'
import Control from '../views/Control.vue'

const routes = [
  {
    path: '/control',
    name: 'control',
    component: Control
  },
  {
    path: '/testcard',
    name: 'Testcard',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Testcard.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
