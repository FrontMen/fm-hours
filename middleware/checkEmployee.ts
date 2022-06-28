import {defineNuxtMiddleware} from '@nuxtjs/composition-api';
import {Context} from '@nuxt/types/app';

export const checkRouteOption = (route: Context['route'], key: string, expectedValue: any) => {
  return route.matched.some(matchedRoute => {
    return Object.values(matchedRoute.components).some(
      (component: any) => component.options && component.options[key] === expectedValue
    );
  });
};

export default defineNuxtMiddleware(({store, redirect, route}) => {
  // A way to override executing this middleware per page
  if (checkRouteOption(route, 'checkEmployee', false)) return;

  if (!store.state.employee.isFound) {
    return redirect('/error/employee-not-found');
  }
});
