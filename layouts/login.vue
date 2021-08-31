<template>
  <Nuxt />
</template>

<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";
export default defineComponent({
  middleware: ["isAuthenticated"],
});
</script>
