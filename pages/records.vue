<template>
  <div class="content-wrapper mt-5">
    <navigation-buttons
      class="mb-5"
      :selected-week="recordsState.selectedWeek"
      @previous="goToWeek('previous')"
      @next="goToWeek('next')"
      @current="goToWeek('current')"
    />

    <empty-timesheet
      v-if="!timesheet.projects.length"
      @copy-previous-week="copyPreviousWeek"
    />

    <template v-else>
      <weekly-timesheet :selected-week="recordsState.selectedWeek">
        <template #rows>
          <weekly-timesheet-row
            v-for="(project, index) in timesheet.projects"
            :key="project.customer.id"
            :project="timesheet.projects[index]"
            :readonly="timesheet.isReadonly || project.isExternal"
            :removeable="!timesheet.isReadonly && !project.isExternal"
            :selected-week="recordsState.selectedWeek"
            :value-formatter="timesheetFormatter"
            @change="hasUnsavedChanges = true"
            @remove="deleteProject(timesheet.projects[index])"
          />

          <weekly-timesheet-totals-row
            :projects="timesheet.projects"
            :selected-week="recordsState.selectedWeek"
            :work-scheme="recordsState.workScheme"
            :show-add-project-button="
              !timesheet.isReadonly && selectableCustomers.length > 0
            "
          />
        </template>
      </weekly-timesheet>

      <template v-if="user.travelAllowance && timesheet.travelProject">
        <h3 class="my-5">Travel allowance</h3>

        <weekly-timesheet :selected-week="recordsState.selectedWeek">
          <template #rows>
            <weekly-timesheet-row
              :project="timesheet.travelProject"
              :readonly="timesheet.isReadonly"
              :removable="false"
              :selected-week="recordsState.selectedWeek"
              :value-formatter="kilometerFormatter"
              @change="hasUnsavedChanges = true"
            />
          </template>
        </weekly-timesheet>
      </template>

      <weekly-timesheet-footer
        class="mt-5"
        :has-unsaved-changes="hasUnsavedChanges"
        :is-saving="recordsState.isSaving"
        :last-saved="recordsState.lastSaved"
        :status="timesheet.status"
        @save="saveTimesheet"
        @submit="submitTimesheet"
        @unsubmit="saveTimesheet"
      />
    </template>

    <select-project-dialog
      :projects="selectableCustomers"
      @project-selected="addProject"
    />
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  ref,
  useStore,
  watch,
} from "@nuxtjs/composition-api";
import { startOfISOWeek, subDays } from "date-fns";

import EmptyTimesheet from "~/components/records/empty-timesheet.vue";
import NavigationButtons from "~/components/records/navigation-buttons.vue";
import SelectProjectDialog from "~/components/records/select-project-dialog.vue";
import WeeklyTimesheetFooter from "~/components/records/weekly-timesheet-footer.vue";
import WeeklyTimesheetRow from "~/components/records/weekly-timesheet-row.vue";
import WeeklyTimesheetTotalsRow from "~/components/records/weekly-timesheet-totals-row.vue";

import { buildWeek } from "~/helpers/dates";
import { recordStatus } from "~/helpers/record-status";
import {
  createWeeklyTimesheet,
  generateValueFormatter,
} from "~/helpers/timesheet";

export default defineComponent({
  components: {
    EmptyTimesheet,
    NavigationButtons,
    SelectProjectDialog,
    WeeklyTimesheetRow,
    WeeklyTimesheetFooter,
    WeeklyTimesheetTotalsRow,
  },
  middleware: ["isAuthenticated"],
  setup() {
    const store = useStore<RootStoreState>();
    const user = computed(() => store.state.user.user);
    const recordsState = computed(() => store.state.records);

    store.dispatch("customers/getCustomers");
    store.dispatch("records/getRecords", {
      startDate: new Date(),
    });

    const selectableCustomers = computed(() => {
      const customers = store.state.customers.customers;
      const selectedCustomers = timesheet.value.projects.map(
        (project) => project.customer.id
      );

      const selectableCustomers = customers.filter(
        (x) =>
          user.value?.projects.includes(x.id) &&
          !selectedCustomers.includes(x.id)
      );

      return [
        { text: "Choose project", disabled: true },
        ...selectableCustomers.map((entry) => ({
          value: entry.id,
          text: entry.name,
        })),
      ];
    });

    const hasUnsavedChanges = ref<Boolean>(false);
    const timesheet = ref<WeeklyTimesheet>({
      isReadonly: false,
      status: "new" as RecordStatus,
      projects: [],
      travelProject: null,
    });

    const goToWeek = (to: "current" | "previous" | "next") => {
      if (hasUnsavedChanges.value) {
        const confirmation = confirm(
          "You have unsaved changes, are you sure you want to switch to another week?"
        );

        if (!confirmation) return;
      }

      store.dispatch("records/goToWeek", { to });
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

    const saveTimesheet = () => {
      store.dispatch("records/saveTimesheet", {
        week: recordsState.value.selectedWeek,
        timesheet: timesheet.value,
        status: recordStatus.NEW as RecordStatus,
      });

      hasUnsavedChanges.value = false;
    };

    const submitTimesheet = () => {
      store.dispatch("records/saveTimesheet", {
        week: recordsState.value.selectedWeek,
        timesheet: timesheet.value,
        status: recordStatus.PENDING as RecordStatus,
      });

      hasUnsavedChanges.value = false;
    };

    return {
      user,
      goToWeek,
      copyPreviousWeek,
      addProject,
      deleteProject,
      selectableCustomers,
      recordsState,
      hasUnsavedChanges,
      timesheet,
      timesheetFormatter: generateValueFormatter(0, 24),
      kilometerFormatter: generateValueFormatter(0, 9999),
      saveTimesheet,
      submitTimesheet,
    };
  },
});
</script>
