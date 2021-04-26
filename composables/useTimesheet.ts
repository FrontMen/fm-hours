import { computed, useStore, ref, watch } from "@nuxtjs/composition-api";
import { startOfISOWeek, subDays } from "date-fns";

import { buildWeek } from "~/helpers/dates";
import { recordStatus } from "~/helpers/record-status";
import {
  createWeeklyTimesheet,
  generateValueFormatter,
} from "~/helpers/timesheet";

export default (employeeId: string) => {
  const store = useStore<RootStoreState>();
  const hasUnsavedChanges = ref<Boolean>(false);
  const recordsState = computed(() => store.state.records);

  const timesheet = ref<WeeklyTimesheet>({
    isReadonly: false,
    status: "new" as RecordStatus,
    projects: [],
    travelProject: null,
  });

  store.dispatch("records/getRecords", {
    employeeId,
    startDate: new Date(),
  });

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
      status: recordStatus.NEW as RecordStatus,
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

      timesheet.value = createWeeklyTimesheet({
        week: recordsState.value.selectedWeek,
        timeRecords: recordsState.value.timeRecords,
        travelRecords: recordsState.value.travelRecords,
        workScheme: recordsState.value.workScheme,
      });
    },
    { deep: true }
  );

  const saveTimesheet = (recordStatus: RecordStatus) => {
    store.dispatch("records/saveTimesheet", {
      employeeId,
      week: recordsState.value.selectedWeek,
      timesheet: timesheet.value,
      status: recordStatus,
    });

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
  };
};
