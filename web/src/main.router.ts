
import { Id } from '@krakerxyz/netled-core';
import { createRouter, createWebHistory, NavigationGuard, RouteLocationRaw, RouteRecordRaw } from 'vue-router';
//import { useLoginService } from './services';

//const isLoggedIn = useLoginService(() => router).status;

const requireLogin: NavigationGuard = (to, _from, next) => {
    // if (isLoggedIn.value === 'signedIn') { return next(); }
    // if (to.name === 'home') { return next(); }
    // const loginRoute: RouteLocationRaw = { name: 'login', query: { ret: to.fullPath } };
    // next(loginRoute);
    return next();
};

export enum RouteName {
    Home = 'home',
    Login = 'login',
    AnimationList = 'animation-list',
    AnimationConfigs = 'animation-configs',
    AnimationConfig = 'animation-config',
    AnimationEditor = 'animation-editor',
    DeviceList = 'device-list',
    DeviceAdd = 'device-add',
    DeviceView = 'device-view',
    PostList = 'post-list',
    PostEditor = 'post-editor',
    Test = 'test',
}

export function useRoute(name: RouteName.Home): RouteLocationRaw
export function useRoute(name: RouteName.Test): RouteLocationRaw
export function useRoute(name: RouteName.Login): RouteLocationRaw
export function useRoute(name: RouteName.AnimationList): RouteLocationRaw
export function useRoute(name: RouteName.AnimationConfigs, params: { animationId: string, version: number }): RouteLocationRaw
export function useRoute(name: RouteName.AnimationConfig, params: { configId: Id }): RouteLocationRaw
export function useRoute(name: RouteName.AnimationEditor, params: { animationId: Id | 'new' }): RouteLocationRaw
export function useRoute(name: RouteName.PostList): RouteLocationRaw
export function useRoute(name: RouteName.PostEditor, params: { postId: Id | 'new' }): RouteLocationRaw
export function useRoute(name: RouteName.DeviceList): RouteLocationRaw
export function useRoute(name: RouteName.DeviceAdd): RouteLocationRaw
export function useRoute(name: RouteName.DeviceView, params: { deviceId: Id }): RouteLocationRaw
export function useRoute(name: RouteName, params?: any): RouteLocationRaw {
    return {
        name,
        params
    };
}

const routes: RouteRecordRaw[] = [
    {
        name: RouteName.Home,
        path: '/',
        component: () => import('./components/Home.vue')
    },
    {
        name: RouteName.Test,
        path: `/${RouteName.Test}`,
        component: () => import('./components/test/Test.vue')
    },
    {
        name: RouteName.Login,
        path: '/login',
        component: () => import('./components/Login.vue')
    },
    {
        name: RouteName.AnimationList,
        path: '/animations',
        beforeEnter: requireLogin,
        component: () => import('./components/animations/AnimationList.vue')
    },
    {
        name: RouteName.AnimationConfigs,
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
        name: RouteName.AnimationConfig,
        path: '/animations/configs/:configId',
        beforeEnter: requireLogin,
        component: () => import('./components/animations/configs/Config.vue'),
        props: true
    },
    {
        name: RouteName.AnimationEditor,
        path: '/animations/:animationId/editor',
        beforeEnter: requireLogin,
        component: () => import('./components/animations/editor/AnimationEditor.vue')
    },
    {
        name: RouteName.PostList,
        path: '/posts',
        beforeEnter: requireLogin,
        component: () => import('./components/posts/PostList.vue')
    },
    {
        name: RouteName.PostEditor,
        path: '/posts/:postId/editor',
        beforeEnter: requireLogin,
        component: () => import('./components/posts/editor/PostEditor.vue'),
        props: true
    },
    {
        name: RouteName.DeviceList,
        path: '/devices',
        beforeEnter: requireLogin,
        component: () => import('./components/devices/DeviceList.vue')
    },
    {
        name: RouteName.DeviceAdd,
        path: '/devices/add',
        beforeEnter: requireLogin,
        component: () => import('./components/devices/DeviceAdd.vue')
    },
    {
        name: RouteName.DeviceView,
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
