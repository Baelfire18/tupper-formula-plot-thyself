import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import LandingView from '../views/LandingView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'landing',
    component: LandingView,
  },
  {
    path: '/playground',
    name: 'playground',
    component: () => import('../views/PlaygroundView.vue'),
  },
  {
    path: '/credits',
    name: 'credits',
    component: () => import('../views/CreditsView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Track page views for Google Analytics
router.afterEach((to) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-13S3TJEY6W', {
      page_path: to.fullPath,
    })
  }
})

export default router
