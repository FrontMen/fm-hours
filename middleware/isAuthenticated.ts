import {defineNuxtMiddleware} from '@nuxtjs/composition-api';

export default defineNuxtMiddleware(({store, redirect}) => {
  const isAuthenticated = store.getters['auth/isAuthenticated'];
  if (isAuthenticated) {
    return redirect('/');
  }
});
