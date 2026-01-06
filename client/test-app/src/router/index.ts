import { createRouter, createWebHistory } from 'vue-router';
import { authService } from '@/services/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/rooms',
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('../views/SignupView.vue'),
    },
    {
      path: '/rooms',
      name: 'rooms',
      component: () => import('../views/RoomListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/rooms/:id',
      name: 'room-detail',
      component: () => import('../views/RoomDetailView.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated();
  console.log('Router guard - navigating to:', to.path);
  console.log('Router guard - isAuthenticated:', isAuthenticated);
  console.log('Router guard - token in localStorage:', localStorage.getItem('access_token'));

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Redirecting to /login - auth required but not authenticated');
    next('/login');
  } else if ((to.name === 'login' || to.name === 'signup') && isAuthenticated) {
    console.log('Redirecting to /rooms - already authenticated');
    next('/rooms');
  } else {
    console.log('Proceeding to:', to.path);
    next();
  }
});

export default router;
