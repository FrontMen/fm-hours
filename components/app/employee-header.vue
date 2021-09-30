<template>
  <b-row no-gutters align-v="center">
    <b-col cols="0" class="mr-2">
      <b-avatar :src="employee.picture" />
    </b-col>

    <b-col>
      <div class="font-weight-bold">
        {{ employee.name }}
      </div>
      <div class="font-weight-light">BridgeUid: {{ employee.bridgeUid }}</div>
    </b-col>
  </b-row>
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
