
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
   {
      name: 'default',
      path: '/',
      component: () => import('./components/animation-list/AnimationList.vue')
   },
   {
      name: 'config',
      path: '/config/:animationId',
      component: () => import('./components/config/Config.vue')
   },
   {
      name: 'editor',
      path: '/editor',
      component: () => import('./components/editor/Editor.vue')
   }
];

export const router = createRouter({
   history: createWebHistory(),
   routes,
   linkActiveClass: 'active',
   linkExactActiveClass: 'active-exact',
});