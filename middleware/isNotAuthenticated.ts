import {defineNuxtMiddleware} from '@nuxtjs/composition-api';

export default defineNuxtMiddleware(({store, redirect, route}) => {
  if (!store.getters['auth/isAuthenticated'] && route.path !== '/login') {
    return redirect('/login');
  }
});
