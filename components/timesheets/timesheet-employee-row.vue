<template>
  <b-row
    class="timesheet-employee-row app-table__row py-3"
    no-gutters
    @click="handleClick"
  >
    <b-col cols="0" class="mr-2">
      <b-avatar :src="employee.picture" />
    </b-col>

    <b-col>
      <div class="font-weight-bold">
        {{ displayName }}
      </div>

      <div v-if="employee.status === recordStatus.NEW" class="text-success">
        Nothing to approve
      </div>

      <div v-if="employee.status === recordStatus.PENDING" class="text-warning">
        Waiting on approval
      </div>

      <div v-if="employee.status === recordStatus.DENIED" class="text-danger">
        Has denied records
      </div>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from "@nuxtjs/composition-api";
import { recordStatus } from "~/helpers/record-status";

export default defineComponent({
  emits: ["click"],
  props: {
    employee: {
      type: Object as PropType<TimesheetEmployee>,
      required: true,
    },
  },
  setup(props, { emit }) {
    const handleClick = () => emit("click");

    const displayName = computed(
      () =>
        `${props.employee.name}${props.employee.endDate ? " (Inactive)" : ""}`
    );

    return {
      handleClick,
      recordStatus,
      displayName,
    };
  },
});
</script>

<style lang="scss">
.timesheet-employee-row {
  cursor: pointer;
}
</style>
