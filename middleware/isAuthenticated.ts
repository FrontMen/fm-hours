import {defineNuxtMiddleware} from '@nuxtjs/composition-api';

export default defineNuxtMiddleware(({store, redirect, route}) => {
  console.log('path ', route.path);
  if (store.getters['auth/isUserLoggedIn'] && route.path === '/login') {
    return redirect('/');
  }
});
