import {defineNuxtMiddleware} from '@nuxtjs/composition-api';

export default defineNuxtMiddleware(({store, redirect}) => {
  if (!store.getters['auth/isEmployeeLoggedIn']) {
    return redirect('/login');
  }
});
