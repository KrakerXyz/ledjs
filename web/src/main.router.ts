
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
   {
      name: 'animation-list',
      path: '/',
      component: () => import('./components/animation-list/AnimationList.vue')
   },
   {
      name: 'device-list',
      path: '/devices',
      component: () => import('./components/devices/DeviceList.vue')
   },
   {
      name: 'device-add',
      path: '/devices/add',
      component: () => import('./components/devices/DeviceAdd.vue')
   },
   {
      name: 'device-view',
      path: '/devices/:deviceId',
      component: () => import('./components/devices/DeviceView.vue'),
      props: true
   },
   {
      name: 'config',
      path: '/config/:animationId',
      component: () => import('./components/config/Config.vue')
   },
   {
      name: 'editor',
      path: '/editor/:animationId',
      component: () => import('./components/editor/Editor.vue')
   }
];

export const router = createRouter({
   history: createWebHistory(),
   routes,
   linkActiveClass: 'active',
   linkExactActiveClass: 'active-exact',
});