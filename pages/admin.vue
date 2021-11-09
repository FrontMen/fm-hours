<template>
  <NuxtChild />
</template>
<script lang="ts">
import {defineComponent} from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ['isAdmin'],
});
</script>
