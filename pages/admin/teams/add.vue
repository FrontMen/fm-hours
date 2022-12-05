<template>
  <admin-container>
    <team-form mode="add" :team="team" />
  </admin-container>
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
