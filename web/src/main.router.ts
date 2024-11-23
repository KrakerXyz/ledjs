import { createRouter, createWebHistory, type NavigationGuard, type RouteLocationRaw, type RouteRecordRaw } from 'vue-router';
import { useAuthService } from './services/authService';
import type { Id } from '$core/rest/model/Id';

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
    PostProcessorList = 'post-processors',
    PostProcessorNew = 'post-processors/new',
    PostProcessorEditor = 'post-processors/:postProcessorId/edit',
    StrandList = 'strands',
    StrandNew = 'strands/new',
    StrandEditor = 'stands/:strandId/edit',
    DeviceList = 'devices',
    DeviceAdd = 'devices/add',
    DeviceView = 'devices/:deviceId',
}

export function useRouteLocation(name: RouteName.Home): RouteLocationRaw
export function useRouteLocation(name: RouteName.AnimationList): RouteLocationRaw
export function useRouteLocation(name: RouteName.AnimationNew): RouteLocationRaw
export function useRouteLocation(name: RouteName.AnimationEditor, params: { animationId: Id }): RouteLocationRaw
export function useRouteLocation(name: RouteName.PostProcessorList): RouteLocationRaw
export function useRouteLocation(name: RouteName.PostProcessorNew): RouteLocationRaw
export function useRouteLocation(name: RouteName.PostProcessorEditor, params: { postProcessorId: Id }): RouteLocationRaw
export function useRouteLocation(name: RouteName.StrandList): RouteLocationRaw
export function useRouteLocation(name: RouteName.StrandNew): RouteLocationRaw
export function useRouteLocation(name: RouteName.StrandEditor, params: {strandId: Id}, query?: { selectedId: Id | undefined }): RouteLocationRaw
export function useRouteLocation(name: RouteName.DeviceList): RouteLocationRaw
export function useRouteLocation(name: RouteName.DeviceAdd): RouteLocationRaw
export function useRouteLocation(name: RouteName.DeviceView, params: { deviceId: Id }): RouteLocationRaw
export function useRouteLocation(name: RouteName, params?: any, query?: any): RouteLocationRaw {
    return {
        name,
        params,
        query,
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
                name: RouteName.PostProcessorList,
                path: RouteName.PostProcessorList,
                beforeEnter: requireLogin,
                component: () => import('./components/post-processors/PostProcessorList.vue')
            },
            {
                name: RouteName.PostProcessorNew,
                path: RouteName.PostProcessorNew,
                beforeEnter: requireLogin,
                component: () => import('./components/post-processors/PostProcessorNew.vue')
            },
            {
                name: RouteName.PostProcessorEditor,
                path: RouteName.PostProcessorEditor,
                beforeEnter: requireLogin,
                component: () => import('./components/post-processors/editor/ProcessorEditor.vue'),
                props: true
            },
            {
                name: RouteName.StrandList,
                path: RouteName.StrandList,
                beforeEnter: requireLogin,
                component: () => import('./components/strands/StrandList.vue')
            },
            {
                name: RouteName.StrandNew,
                path: RouteName.StrandNew,
                beforeEnter: requireLogin,
                component: () => import('./components/strands/StrandNew.vue')
            },
            {
                name: RouteName.StrandEditor,
                path: RouteName.StrandEditor,
                beforeEnter: requireLogin,
                component: () => import('./components/strands/StrandEditor.vue'),
                props: true
            },
            {
                name: RouteName.StrandEditor,
                path: RouteName.StrandEditor,
                beforeEnter: requireLogin,
                component: () => import('./components/strands/StrandEditor.vue'),
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
