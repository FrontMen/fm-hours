import {defineNuxtMiddleware} from '@nuxtjs/composition-api';

export default defineNuxtMiddleware(({store, redirect, route}) => {
  const employeeErrorRoutePath = '/error/employee';
  const employeeError = store.getters['employee/error'];
  const isCurrentPathEmployeeError = route.path === employeeErrorRoutePath;

  if (!isCurrentPathEmployeeError && employeeError) {
    return redirect(employeeErrorRoutePath);
  } else if (isCurrentPathEmployeeError && !employeeError) {
    return redirect('/');
  }
});
