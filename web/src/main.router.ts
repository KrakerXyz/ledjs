
import { Id } from '@krakerxyz/netled-core';
import { createRouter, createWebHistory, NavigationGuard, RouteLocationRaw, RouteRecordRaw } from 'vue-router';
import { useAuthService } from './services/authService';

const authService = useAuthService();

/** Redirect to public area after signout */
export function logoutRedirect() {
    window.location.href = '/home';
}

/** Redirect to the user area after login */
export function loginRedirect() {
    if (!window.location.pathname.startsWith('/user')) {
        window.location.href = '/user/animations';
    }
}

const requireLogin: NavigationGuard = async (to, _from, next) => {
    if (!to.path.startsWith('/user')) { return next(); }
    await authService.initialized;
    if (authService.status.value === 'signedIn') { return next(); }
    logoutRedirect();
};

export enum RouteName {
    Home = 'home',
    AnimationList = 'animations',
    AnimationNew = 'animations/new',
    AnimationEditor = 'animations/:animationId/edit',
    DeviceList = 'devices',
    DeviceAdd = 'devices/add',
    DeviceView = 'devices/:deviceId',
}

export function useRouteLocation(name: RouteName.Home): RouteLocationRaw
export function useRouteLocation(name: RouteName.AnimationList): RouteLocationRaw
export function useRouteLocation(name: RouteName.AnimationNew): RouteLocationRaw
export function useRouteLocation(name: RouteName.AnimationEditor, params: {animationId: Id}): RouteLocationRaw
export function useRouteLocation(name: RouteName.DeviceList): RouteLocationRaw
export function useRouteLocation(name: RouteName.DeviceAdd): RouteLocationRaw
export function useRouteLocation(name: RouteName.DeviceView, params: { deviceId: Id }): RouteLocationRaw
export function useRouteLocation(name: RouteName, params?: any): RouteLocationRaw {
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
        name: 'user-area',
        path: '/user',
        redirect: '/user/animations',
        children: [
            {
                name: RouteName.AnimationList,
                path: RouteName.AnimationList,
                beforeEnter: requireLogin,
                component: () => import('./components/animations/AnimationList.vue')
            },
            {
                name: RouteName.AnimationNew,
                path: RouteName.AnimationNew,
                beforeEnter: requireLogin,
                component: () => import('./components/animations/AnimationNew.vue')
            },
            {
                name: RouteName.AnimationEditor,
                path: RouteName.AnimationEditor,
                beforeEnter: requireLogin,
                component: () => import('./components/animations/editor/AnimationEditor.vue'),
                props: true
            },
            {
                name: RouteName.DeviceList,
                path: RouteName.DeviceList,
                beforeEnter: requireLogin,
                component: () => import('./components/devices/DeviceList.vue')
            },
            {
                name: RouteName.DeviceAdd,
                path: RouteName.DeviceAdd,
                beforeEnter: requireLogin,
                component: () => import('./components/devices/DeviceAdd.vue')
            },
            {
                name: RouteName.DeviceView,
                path: RouteName.DeviceView,
                beforeEnter: requireLogin,
                component: () => import('./components/devices/DeviceView.vue'),
                props: true
            }
        ]
    }
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
    linkActiveClass: 'active',
    linkExactActiveClass: 'active-exact',
});
