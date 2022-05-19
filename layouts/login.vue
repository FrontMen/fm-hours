<template>
  <Nuxt />
</template>

<script lang="ts">
import {defineComponent, useStore, computed, useRouter} from '@nuxtjs/composition-api';
export default defineComponent({
  setup() {
    const store = useStore<RootStoreState>();
    const router = useRouter();
    const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
    if (!isAuthenticated.value) return;
    router.replace('/');

  },
});
</script>
