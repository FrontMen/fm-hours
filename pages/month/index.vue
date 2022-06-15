<template>
  <p>redirecting</p>
</template>

<script lang="ts">
import {defineComponent, useRouter, useStore} from "@nuxtjs/composition-api";

export default defineComponent({
  setup() {
    const router = useRouter();
    const employee = useStore<RootStoreState>().state.employee.employee;
    router.replace(`/month/${employee?.id}`);
  }
});
</script>
