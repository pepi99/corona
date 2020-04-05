import Vue from 'vue'
import Router from 'vue-router'
import MainDataComponent from '@/components/MainDataComponent'

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'MainDataComponent',
      component: MainDataComponent
    }
  ]
})
