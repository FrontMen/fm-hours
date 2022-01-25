<template>
  <employee-form mode="add" :employee="employee" />
</template>

<script lang="ts">
import {defineComponent, ref} from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ["isAdmin"],
  setup() {
    const employee = ref({});

    return {
      employee,
    }
  }
});
</script>
