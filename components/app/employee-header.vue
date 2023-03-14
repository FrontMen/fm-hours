<template>
  <header class="h3">
    {{ employee.name }}
  </header>
</template>

<script lang="ts">
import {defineComponent, PropType} from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    employee: {
      type: Object as PropType<Employee | TimesheetEmployee>,
      required: true,
    },
  },
});
</script>
