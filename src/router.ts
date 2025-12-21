import { createRouter, createWebHashHistory } from 'vue-router'
import { useUserStore } from '@/store'
import { DocumentTextOutline } from '@vicons/ionicons5'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    redirect: { name: 'AdminManage' },
    children: [
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/User.vue'),
        meta: {
          key: 'User',
          label: '用户管理',
          icon: DocumentTextOutline,
        },
      },
      {
        path: 'draw',
        name: 'Draw',
        component: () => import('@/views/Draw.vue'),
        meta: {
          key: 'Draw',
          label: '抽奖管理',
          icon: DocumentTextOutline,
        },
      },
      {
        path: 'admin-manage',
        name: 'AdminManage',
        component: () => import('@/views/AdminManage.vue'),
        meta: {
          key: 'AdminManage',
          label: '管理员列表',
          icon: DocumentTextOutline,
        },
      },
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { noAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/ErrorPage/NotFound.vue'),
    meta: { noAuth: true }
  }
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes: routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()
  // 判断是否需要登录
  const needAuth = !to.meta.noAuth
  
  // 从 sessionStorage 获取 token (pinia 持久化存储)
  const hasToken = userStore.userInfo.token ? true : false
  
  if (needAuth && !hasToken) {
    // 需要登录但没有 token，跳转到登录页
    next({ name: 'Login' })
  } else if (to.name === 'Login' && hasToken) {
    // 已登录用户访问登录页，跳转到首页
    next({ path: '/' })
  } else {
    next()
  }
})


