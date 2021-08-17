
import { createRouter, createWebHistory, NavigationGuard, RouteLocationRaw, RouteRecordRaw } from 'vue-router';
import { useLoginService } from './services';

const isLoggedIn = useLoginService(() => router).status;

const requireLogin: NavigationGuard = (to, _from, next) => {
   if (isLoggedIn.value === 'signedIn') { return next(); }
   if (to.name === 'home') { return next(); }
   const loginRoute: RouteLocationRaw = { name: 'login', query: { ret: to.fullPath } };
   next(loginRoute);
};

const routes: RouteRecordRaw[] = [
   {
      name: 'home',
      path: '/',
      component: () => import('./components/Home.vue')
   },
   {
      name: 'login',
      path: '/login',
      component: () => import('./components/Login.vue')
   },
   {
      name: 'animation-list',
      path: '/animations',
      beforeEnter: requireLogin,
      component: () => import('./components/animations/AnimationList.vue')
   },
   {
      name: 'animation-configs',
      path: '/animations/:animationId.:version/configs',
      beforeEnter: requireLogin,
      component: () => import('./components/animations/configs/ConfigList.vue'),
      props: r => {
         return {
            animationId: r.params.animationId,
            version: parseInt(r.params.version as string)
         };
      }
   },
   {
      name: 'animation-config',
      path: '/animations/configs/:configId',
      beforeEnter: requireLogin,
      component: () => import('./components/animations/configs/Config.vue'),
      props: true
   },
   {
      name: 'animation-editor',
      path: '/animations/:animationId/editor',
      beforeEnter: requireLogin,
      component: () => import('./components/animations/editor/Editor.vue')
   },
   {
      name: 'device-list',
      path: '/devices',
      beforeEnter: requireLogin,
      component: () => import('./components/devices/DeviceList.vue')
   },
   {
      name: 'device-add',
      path: '/devices/add',
      beforeEnter: requireLogin,
      component: () => import('./components/devices/DeviceAdd.vue')
   },
   {
      name: 'device-view',
      path: '/devices/:deviceId',
      beforeEnter: requireLogin,
      component: () => import('./components/devices/DeviceView.vue'),
      props: true
   },
];

export const router = createRouter({
   history: createWebHistory(),
   routes,
   linkActiveClass: 'active',
   linkExactActiveClass: 'active-exact',
});
