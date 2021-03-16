<template>
  <div class="page-wrapper">
    <div class="content-wrapper mt-5">
      <div>timesheet user page for id: {{ userId }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, useStore, useRouter } from "@nuxtjs/composition-api";
import { recordStatus } from "~/helpers/record-status";

export default defineComponent({
  setup() {
    const store = useStore<RootStoreState>();
    const router = useRouter();
    const userId = router.currentRoute.params.user_id;

    // TODO: have pending timeRecords
    // TODO: have pending travelRecords
    // TODO: have work scheme
    // TODO: have array of weeks to create array of timesheets

    const saveTimesheet = (
      week: WeekDate[],
      timesheet: WeeklyTimesheet,
      status: RecordStatus
    ) => {
      store.dispatch("timesheets/saveTimesheet", {
        week,
        timesheet,
        status,
      });
    };

    return {
      userId,
      recordStatus,
      saveTimesheet,
    };
  },
});
</script>
