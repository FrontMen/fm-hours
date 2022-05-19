<template>
  <p>redirecting</p>
</template>

<script lang="ts">
import {defineComponent, useRouter, useStore} from "@nuxtjs/composition-api";
import {format} from "date-fns";

export default defineComponent({
  setup() {
    const store = useStore<RootStoreState>();
    const router = useRouter();
    const isAuthenticatedOrError = !store.getters['auth/isAuthenticated'] || store.getters['employee/error']
    if (isAuthenticatedOrError) return;
    router.replace(format(new Date(), '/yyyy/I'));
  }
});
</script>
