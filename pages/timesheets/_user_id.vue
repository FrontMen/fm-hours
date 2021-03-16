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
  useStore,
  useRouter,
  useContext,
} from "@nuxtjs/composition-api";
import { recordStatus } from "~/helpers/record-status";
import { createWeeklyTimesheet } from "~/helpers/timesheet";

export default defineComponent({
  setup() {
    const store = useStore<RootStoreState>();
    const router = useRouter();
    const context = useContext();

    const userId = router.currentRoute.params.user_id;
    store.dispatch("timesheets/selectUser", { userId });

    const users = computed(() => store.state.timesheets.users);
    if (users.value.length === 0) {
      store.dispatch("timesheets/getUserList");
    }

    const pendingTimeRecords = computed(
      () => store.getters["timesheets/getUserPendingTimeRecords"]
    );

    const pendingTravelRecords = computed(
      () => store.getters["timesheets/getUserPendingTravelRecords"]
    );

    const pendingWeeks = computed(
      () => store.getters["timesheets/getUserPendingWeeks"]
    );

    const getTimesheet = (week: WeekDate[]) => {
      const workScheme = context.$workSchemeService.getWorkScheme({
        userId,
        startDate: new Date(week[0].date),
        endDate: new Date(week[6].date),
      });

      return createWeeklyTimesheet({
        week,
        workScheme,
        timeRecords: pendingTimeRecords.value,
        travelRecords: pendingTravelRecords.value,
      });
    };

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
      pendingTimeRecords,
      pendingTravelRecords,
      pendingWeeks,
      recordStatus,
      getTimesheet,
      saveTimesheet,
    };
  },
});
</script>
