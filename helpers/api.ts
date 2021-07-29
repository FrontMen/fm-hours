import {NuxtRuntimeConfig} from '@nuxt/types/config/runtime';

export default function ($config: NuxtRuntimeConfig) {
  return $config.isDevelopment
    ? '/api/v1'
    : 'https://bridge.hosted-tools.com/api/v1';
}
