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
            @update="timesheet.projects[index] = $event"
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
              @update="timesheet.travelProject = $event"
            />
          </template>
        </weekly-timesheet>
      </template>

      <weekly-timesheet-footer
        class="mt-5"
        :is-saving="recordsState.isSaving"
        :last-saved="recordsState.lastSaved"
        :status="timesheet.status"
        @save="saveTimesheet"
        @submit="submitTimesheet"
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
        (x) => !selectedCustomers.includes(x.id)
      );

      return [
        { text: "Choose project", disabled: true },
        ...selectableCustomers.map((entry) => ({
          value: entry.id,
          text: entry.name,
        })),
      ];
    });

    const goToWeek = (to: "current" | "previous" | "next") =>
      store.dispatch("records/goToWeek", { to });

    const timesheet = ref<WeeklyTimesheet>({
      isReadonly: false,
      status: "new" as RecordStatus,
      projects: [],
      travelProject: null,
    });

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
      });
    };

    watch(
      () => [
        recordsState.value.selectedWeek,
        recordsState.value.timeRecords,
        recordsState.value.travelRecords,
      ],
      () => {
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
    };

    // FIXME: the debounce helper is looping?
    // FIXME: should be triggerd on @update of timesheet-row
    // watch(() => timesheet.value, debounce(saveTimesheet, 10000), {
    //   deep: true,
    // });

    const submitTimesheet = () => {
      store.dispatch("records/saveTimesheet", {
        week: recordsState.value.selectedWeek,
        timesheet: timesheet.value,
        status: recordStatus.PENDING as RecordStatus,
      });
    };

    return {
      user,
      goToWeek,
      copyPreviousWeek,
      addProject,
      deleteProject,
      selectableCustomers,
      recordsState,
      timesheet,
      timesheetFormatter: generateValueFormatter(0, 24),
      kilometerFormatter: generateValueFormatter(0, 9999),
      saveTimesheet,
      submitTimesheet,
    };
  },
});
</script>
