import Vue from 'vue'
import Router from 'vue-router'
import MainDataComponent from '@/components/MainDataComponent'
import AboutComponent from "../components/AboutComponent";

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'MainDataComponent',
      component: MainDataComponent
    },
    {
      path: '/about',
      name: 'AboutComponent',
      component: AboutComponent
    }
  ]
})
