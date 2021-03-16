<template>
  <div class="page-wrapper">
    <div class="content-wrapper mt-5">
      <div>timesheet user page for id: {{ userId }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useStore,
  useRouter,
  watch,
} from "@nuxtjs/composition-api";
import { recordStatus } from "~/helpers/record-status";

export default defineComponent({
  setup() {
    const store = useStore<RootStoreState>();
    const router = useRouter();

    const userId = router.currentRoute.params.user_id;
    const users = computed(() => store.state.timesheets.users);

    const pendingTimeRecords = ref<TimeRecord[]>();
    const pendingTravelRecords = ref<TravelRecord[]>();
    const pendingWeeks = ref<TimesheetPendingWeek[]>();

    if (users.value.length === 0) {
      store.dispatch("timesheets/getUserList");
    }

    watch(
      () => users.value,
      () => {
        pendingTimeRecords.value = store.getters[
          "timesheets/getUserPendingTimeRecords"
        ](userId);

        pendingTravelRecords.value = store.getters[
          "timesheets/getUserPendingTravelRecords"
        ](userId);

        pendingWeeks.value = store.getters["timesheets/getPendingWeeks"](
          userId
        );
      },
      { deep: true, immediate: true }
    );

    // TODO: have work scheme

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
