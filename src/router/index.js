import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../Auth/Login.vue'),
      meta: { requiresGuest: true } // Faqat login qilmagan userlar uchun
    },
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../Layout/Mainlayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'homapp',
          component: HomeView,
          meta: { requiresAuth: true }
        },
        {
          path: 'upload',
          name: 'upload',
          component: () => import('../views/Upload.vue'),
          meta: { requiresAuth: true }
        }
      ]
    }
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('access_token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

  if (requiresAuth && !token) {
    // Agar token bo'lmasa va himoyalangan route ga kirmoqchi bo'lsa
    next('/login')
  } else if (requiresGuest && token) {
    // Agar token bor va login sahifaga kirmoqchi bo'lsa
    next('/')
  } else {
    next()
  }
})

export default router