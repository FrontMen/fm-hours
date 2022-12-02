<template>
  <team-form mode="add" :team="team" />
</template>

<script lang="ts">
import {defineComponent, ref} from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ["isAdmin"],
  setup() {
    const team = ref();

    return {
      team,
    }
  }
});
</script>
