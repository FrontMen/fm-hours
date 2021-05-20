import { computed, useStore, ref, watch } from "@nuxtjs/composition-api";
import { startOfISOWeek, subDays } from "date-fns";

import { buildWeek, getDayOnGMT } from "~/helpers/dates";
import { recordStatus } from "~/helpers/record-status";
import {
  createWeeklyTimesheet,
  generateValueFormatter,
} from "~/helpers/timesheet";

export default (employeeId: string, startTimestamp?: number) => {
  const store = useStore<RootStoreState>();
  const hasUnsavedChanges = ref<Boolean>(false);
  const recordsState = computed(() => store.state.records);
  const timesheetState = computed(() => store.state.timesheets);

  const timesheetStatus = computed(() =>
    timesheetState.value.timesheets[0]
      ? timesheetState.value.timesheets[0].status
      : (recordStatus.NEW as TimesheetStatus)
  );

  const isReadonly = computed(
    () =>
      timesheetStatus.value === recordStatus.APPROVED ||
      timesheetStatus.value === recordStatus.PENDING
  );

  const timesheet = ref<WeeklyTimesheet>({
    projects: [],
    travelProject: null,
  });

  const initialDate = startTimestamp ? getDayOnGMT(startTimestamp) : new Date();

  store.dispatch("records/getRecords", {
    employeeId,
    startDate: initialDate,
  });

  const message = ref<string>(
    timesheetState.value?.timesheets[0]
      ? timesheetState.value?.timesheets[0].message
      : ""
  );
  watch(
    () => timesheetState.value?.timesheets[0],
    () => {
      message.value = timesheetState.value?.timesheets[0]?.message;
    },
    { immediate: true }
  );

  const goToWeek = (to: "current" | "previous" | "next") => {
    if (hasUnsavedChanges.value) {
      const confirmation = confirm(
        "You have unsaved changes, are you sure you want to switch to another week?"
      );

      if (!confirmation) return;
    }

    store.dispatch("records/goToWeek", { employeeId, to });
  };

  const addProject = (id: string) => {
    const allCustomers = store.state.customers.customers;
    const customer = allCustomers.find((x) => x.id === id) as Customer;

    timesheet.value.projects.push({
      customer,
      values: Array.from(Array(7), () => 0),
      ids: Array.from(Array(7), () => null),
      isExternal: false,
    });
  };

  const deleteProject = (project: TimesheetProject) => {
    hasUnsavedChanges.value = false;

    store.dispatch("records/deleteProjectRecords", {
      week: recordsState.value.selectedWeek,
      project,
      employeeId,
    });
  };

  const copyPreviousWeek = () => {
    const startDate = new Date(recordsState.value.selectedWeek[0].date);
    const prevStartDate = subDays(startDate, 7);
    const previousWeek = buildWeek(startOfISOWeek(prevStartDate), []);

    timesheet.value = createWeeklyTimesheet({
      week: previousWeek,
      timeRecords: recordsState.value.timeRecords,
      travelRecords: recordsState.value.travelRecords,
      workScheme: recordsState.value.workScheme,
    });

    hasUnsavedChanges.value = true;
  };

  watch(
    () => [
      recordsState.value.selectedWeek,
      recordsState.value.timeRecords,
      recordsState.value.travelRecords,
    ],
    () => {
      hasUnsavedChanges.value = false;

      store.dispatch("timesheets/getTimesheets", {
        date: new Date(recordsState.value.selectedWeek[0].date).getTime(),
        employeeId,
      });

      timesheet.value = createWeeklyTimesheet({
        week: recordsState.value.selectedWeek,
        timeRecords: recordsState.value.timeRecords,
        travelRecords: recordsState.value.travelRecords,
        workScheme: recordsState.value.workScheme,
      });
    },
    { deep: true }
  );

  const saveTimesheet = (newTimesheetStatus: TimesheetStatus) => {
    store.dispatch("records/saveTimesheet", {
      employeeId,
      week: recordsState.value.selectedWeek,
      timesheet: timesheet.value,
    });

    const newTimesheet = timesheetState.value.timesheets[0]
      ? {
          ...timesheetState.value.timesheets[0],
          status: newTimesheetStatus,
          message: message.value || "",
        }
      : {
          employeeId,
          date: new Date(recordsState.value.selectedWeek[0].date).getTime(),
          status: newTimesheetStatus,
          message: message.value || "",
        };

    store.dispatch("timesheets/saveTimesheet", newTimesheet);

    hasUnsavedChanges.value = false;
  };

  return {
    goToWeek,
    copyPreviousWeek,
    addProject,
    deleteProject,
    hasUnsavedChanges,
    timesheet,
    timesheetFormatter: generateValueFormatter(0, 24),
    kilometerFormatter: generateValueFormatter(0, 9999),
    saveTimesheet,
    timesheetStatus,
    isReadonly,
    message,
  };
};
