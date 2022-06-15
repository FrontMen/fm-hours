<template>
  <p>redirecting</p>
</template>

<script lang="ts">
import {defineComponent, useRouter} from "@nuxtjs/composition-api";

export default defineComponent({
  setup() {
    const router = useRouter();
    const currentYear = new Date().getFullYear();
    router.replace(`/year/${currentYear}`);
  }
});
</script>
