<template>
  <header class="employee-header">
    <img :src="employee.picture" alt="avatar" class="avatar" />

    <div class="employee-details">
      <span class="bold">
        {{ employee.name }}
      </span>
      <span class="light">BridgeUid: {{ employee.bridgeUid }}</span>
    </div>
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

<style lang="scss" scoped>

.employee-header {
  align-items: center;
  display: flex;
}

.avatar {
  display: flex;
  border-radius: 50%;
  object-fit: cover;
}

.employee-details {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  margin-left: 15px;

  .bold {
    font-weight: 700;
  }

  .light {
    font-weight: 200;
  }
}
</style>
