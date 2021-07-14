
import { createRouter, createWebHistory, NavigationGuardWithThis, RouteLocationNormalized, RouteRecordRaw } from 'vue-router';
import App from './App.vue';

const routes: RouteRecordRaw[] = [
   {
      name: 'default',
      path: '/',
      component: App
   }
];

export const router = createRouter({
   history: createWebHistory(),
   routes,
   linkActiveClass: 'active',
   linkExactActiveClass: 'active-exact',
});