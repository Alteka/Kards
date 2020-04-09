import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'control',
      component: require('@/components/Control').default
    },
    {
      path: '/testcard',
      name: 'testcard',
      component: require('@/components/TestCard').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
