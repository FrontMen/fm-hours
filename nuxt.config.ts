import i18n from './i18n.config';

require('dotenv').config();

export default {
  target: 'static',
  loading: {
    color: '#ff5900',
    height: '5px',
  },
  /**
   * @nuxtjs/vercel-builder enables this on CI.
   */
  standalone: true,
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: 'Frontmen - Hours',
    meta: [
      {charset: 'utf-8'},
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1, user-scalable=no',
      },
      {hid: 'description', name: 'description', content: ''},
    ],
    link: [{rel: 'icon', type: 'image/x-icon', href: '/favicon.ico'}],
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: ['@/assets/scss/index.scss'],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [
    '~plugins/filters',
    '~/plugins/services',
    {src: '~/plugins/thirdPartyComponents', mode: 'client'},
  ],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: {
    dirs: [
      '~/components',
      '~/components/app',
      '~/components/records',
      '~/components/reports',
      '~/components/employees',
    ],
  },

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    '@nuxtjs/dotenv',

    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://composition-api.nuxtjs.org/

    '@nuxtjs/composition-api/module',
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: [
    // https://go.nuxtjs.dev/bootstrap
    [
      'bootstrap-vue/nuxt',
      {
        icons: true,
      },
    ],
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa',
    '@nuxtjs/firebase',
    // https://go.nuxtjs.dev/axios
    // load axios before firebase because: https://github.com/nuxt/nuxt.js/issues/7536#issuecomment-648957310
    '@nuxtjs/axios',
    'nuxt-i18n',
  ],

  publicRuntimeConfig: {
    isDevelopment: process.env.NODE_ENV === 'development',
  },

  firebase: {
    config: {
      // REQUIRED: Official config for firebase.initializeApp(config):
      apiKey: process.env.FB_API_Key!,
      authDomain: process.env.FB_AUTH_DOMAIN!,
      databaseURL: process.env.FB_DATABASE_URL!,
      projectId: process.env.FB_PROJECT_ID!,
      storageBucket: process.env.FB_STORAGE_BUCKET!,
      messagingSenderId: process.env.FB_MESSAGING_SENDER_ID!,
      measurementId: process.env.FB_MESSAGING_ID || '',
      appId: process.env.FB_APP_ID!,
    },
    services: {
      firestore: true,
      auth: {
        initialize: {
          onAuthStateChangedAction: 'auth/onAuthStateChangedAction',
        },
      },
    },
  },

  pwa: {
    meta: false,
    icon: false,
    workbox: {
      importScripts: ['/firebase-auth-sw.js'],
      // by default the workbox module will not install the service worker in dev environment to avoid conflicts with HMR
      // only set this true for testing and remember to always clear your browser cache in development
      dev: process.env.NODE_ENV === 'development',
    },
  },

  i18n,

  // Axios module configuration (https://go.nuxtjs.dev/config-axios)
  axios: {
    proxy: true,
  },

  proxy: [
    'https://bridge.hosted-tools.com/api/v1',
    'https://auth.hosted-tools.com/api/get-token',
  ],

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {},
};
