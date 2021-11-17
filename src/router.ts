import {createRouter, createWebHashHistory} from 'vue-router';

const router = createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            component: () => import('./Search/Search.vue')
        },
        {
            path: '/editor',
            component: () => import('./Editor/Editor.vue')
        },
        {
            path: '/db-manager',
            component: () => import('./DbManager/DbManager.vue')
        },
    ]
});

export default router;
