<template>
  <div class="page-wrapper">
    <div class="content-wrapper mt-5">
      <timesheet-user-header v-if="user" :user="user" />

      <div v-if="pendingWeeks.length === 0" class="mt-4">
        No timesheets to approve
      </div>

      <div
        v-for="(week, weekIndex) in pendingWeeks"
        :key="weekIndex"
        class="mt-5"
        :set="(weekData = getTimesheetAndWorkscheme(week.dates))"
      >
        <weekly-pending-timesheet
          :week="week.dates"
          :timesheet="weekData.timesheet"
          :work-scheme="weekData.workScheme"
          @deny="
            saveTimesheet(week.dates, weekData.timesheet, recordStatus.DENIED)
          "
          @approve="
            saveTimesheet(week.dates, weekData.timesheet, recordStatus.APPROVED)
          "
        />
      </div>
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

import TimesheetUserHeader from "~/components/timesheets/timesheet-user-header.vue";
import WeeklyPendingTimesheet from "~/components/timesheets/weekly-pending-timesheet.vue";
import { recordStatus } from "~/helpers/record-status";
import {
  createWeeklyTimesheet,
  generateValueFormatter,
} from "~/helpers/timesheet";

export default defineComponent({
  components: { TimesheetUserHeader, WeeklyPendingTimesheet },
  middleware: ["isAdmin"],
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

    const getTimesheetAndWorkscheme = (week: WeekDate[]) => {
      const workScheme = context.$workSchemeService.getWorkScheme({
        userId,
        startDate: new Date(week[0].date),
        endDate: new Date(week[6].date),
      });

      return {
        workScheme,
        timesheet: createWeeklyTimesheet({
          week,
          workScheme,
          timeRecords: pendingTimeRecords.value,
          travelRecords: pendingTravelRecords.value,
        }),
      };
    };

    const saveTimesheet = (
      week: WeekDate[],
      timesheet: WeeklyTimesheet,
      status: RecordStatus
    ) => {
      store.dispatch("timesheets/saveTimesheet", {
        userId,
        week,
        timesheet,
        status,
      });
    };

    return {
      user: computed(() => users.value.find((x) => x.id === userId)),
      pendingTimeRecords,
      pendingTravelRecords,
      pendingWeeks,
      recordStatus,
      getTimesheetAndWorkscheme,
      saveTimesheet,
      timesheetFormatter: generateValueFormatter(0, 24),
      kilometerFormatter: generateValueFormatter(0, 9999),
    };
  },
});
</script>
