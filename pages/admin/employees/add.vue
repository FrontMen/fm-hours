<template>
  <admin-container>
    <employee-form mode="add" :employee="employee" />
  </admin-container>
</template>

<script lang="ts">
import {defineComponent, ref} from "@nuxtjs/composition-api";

export default defineComponent({
  middleware: ["isAdmin"],
  setup() {
    const employee = ref({billable: true});

    return {
      employee,
    }
  }
});
</script>
