import {defineNuxtMiddleware} from '@nuxtjs/composition-api';

export default defineNuxtMiddleware(({store, redirect}) => {
  console.log('isLoggedIn middleware');
  if (store.getters['employee/isEmployeeLoggedIn']) {
    console.log('redirect');
    return redirect('/records');
  }
});
