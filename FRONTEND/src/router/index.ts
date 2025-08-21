import { createRouter, createWebHistory } from 'vue-router';
import AuthService from '@/services/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard'
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: {
        requiresAuth: false,
        title: 'Iniciar Sesión - Sistema OEE'
      }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: {
        requiresAuth: true,
        title: 'Dashboard - Sistema OEE',
        roles: ['administrador', 'supervisor', 'operador', 'viewer']
      }
    },
    {
      path: '/registro',
      name: 'Registro',
      component: () => import('@/views/Registro.vue'),
      meta: {
        requiresAuth: true,
        title: 'Registro de Datos - Sistema OEE',
        roles: ['administrador', 'supervisor', 'operador']
      }
    },
    {
      path: '/reportes',
      name: 'Reportes',
      component: () => import('@/views/Reportes.vue'),
      meta: {
        requiresAuth: true,
        title: 'Reportes - Sistema OEE',
        roles: ['administrador', 'supervisor', 'viewer']
      }
    },
    {
      path: '/admin',
      name: 'Administracion',
      component: () => import('@/views/Administracion.vue'),
      meta: {
        requiresAuth: true,
        title: 'Administración - Sistema OEE',
        roles: ['administrador']
      }
    },
    // Ruta 404
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue'),
      meta: {
        title: 'Página No Encontrada'
      }
    }
  ],
});

// Guard de navegación global
router.beforeEach((to, from, next) => {

  console.log('🔄 Router guard - Navegando de', from.path, 'a', to.path);
  console.log('🔍 AuthService.isAuthenticated():', AuthService.isAuthenticated());
  console.log('🔍 Token en localStorage:', localStorage.getItem('auth_token'));
  // Actualizar título de la página
  document.title = to.meta.title as string || 'Sistema OEE - Fábrica Rosana';

  const requiresAuth = to.meta.requiresAuth;
  const isAuthenticated = AuthService.isAuthenticated();
  const currentUser = AuthService.getCurrentUser();

  // Rutas que requieren autenticación
  if (requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  // Si está autenticado y va a login, redirigir a dashboard
  if (to.name === 'Login' && isAuthenticated) {
    next('/dashboard');
    return;
  }

  // Verificar roles si está definido
  const allowedRoles = to.meta.roles as string[];
  if (requiresAuth && allowedRoles && currentUser) {
    if (!allowedRoles.includes(currentUser.rol)) {
      // Usuario no tiene permisos para esta ruta
      console.warn(`Usuario ${currentUser.username} no tiene permisos para acceder a ${to.path}`);
      next('/dashboard'); // Redirigir al dashboard
      return;
    }
  }

  next();
});

export default router;
