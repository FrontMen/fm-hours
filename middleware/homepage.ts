import {defineNuxtMiddleware} from '@nuxtjs/composition-api';
import {format} from 'date-fns';
import type {LocaleObject} from 'nuxt-i18n';

export default defineNuxtMiddleware(({route, redirect, localePath, i18n}) => {
  // @ts-ignore
  const homepageUrls = i18n.locales.map((l: LocaleObject) => `/${l.code}`);
  const isHomepage = ['/', ...homepageUrls].includes(route.fullPath);

  if (isHomepage) {
    // redirect to current week
    return redirect(localePath(format(new Date(), '/yyyy/I')));
  }
});
