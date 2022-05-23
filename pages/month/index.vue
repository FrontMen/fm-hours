<template>
  <p>redirecting</p>
</template>

<script lang="ts">
import {defineComponent, useRouter} from "@nuxtjs/composition-api";

export default defineComponent({
  setup() {
    const router = useRouter();
    router.replace("/month/default");
  }
});
</script>
