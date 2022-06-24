<template>
  <p>redirecting</p>
</template>

<script lang="ts">
import {defineComponent, useRouter, useStore} from "@nuxtjs/composition-api";

export default defineComponent({
  setup() {
    const router = useRouter();
    const employee = useStore<RootStoreState>().state.employee.employee;
    const year = new Date().getFullYear();
    const month = new Date().getMonth();
    router.replace(`/insights/${employee?.id}/${year}/${month}`);
  }
});
</script>
