<template>
  <b-row
    class="timesheet-user-row app-table__row py-3"
    no-gutters
    @click="handleClick"
  >
    <b-col cols="0" class="mr-2">
      <b-avatar :src="user.picture" />
    </b-col>

    <b-col>
      <div class="font-weight-bold">
        {{ user.name }}
      </div>

      <div v-if="user.status === recordStatus.NEW" class="text-success">
        Nothing to approve
      </div>

      <div v-if="user.status === recordStatus.PENDING" class="text-warning">
        Waiting on approval
      </div>

      <div v-if="user.status === recordStatus.DENIED" class="text-danger">
        Has denied records
      </div>
    </b-col>
  </b-row>
</template>

<script lang="ts">
import { defineComponent, PropType } from "@nuxtjs/composition-api";
import { recordStatus } from "~/helpers/record-status";

export default defineComponent({
  emits: ["click"],
  props: {
    user: {
      type: Object as PropType<TimesheetUser>,
      required: true,
    },
  },
  setup(_, { emit }) {
    const handleClick = () => emit("click");

    return {
      handleClick,
      recordStatus,
    };
  },
});
</script>

<style lang="scss">
.timesheet-user-row {
  cursor: pointer;
}
</style>
