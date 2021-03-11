<template>
  <div class="content-wrapper mt-5">
    <navigation-buttons
      class="mb-5"
      :selected-week="recordsState.selectedWeek"
      @previous="goToPreviousWeek()"
      @next="goToNextWeek()"
      @current="goToCurrentWeek()"
    />

    <empty-timesheet
      v-if="!timesheet.projects.length"
      @copy-previous-week="() => console.log('test')"
    />

    <weekly-timesheet v-else :selected-week="recordsState.selectedWeek">
      <template #rows>
        <!-- disable inputs while saving? -->
        <weekly-timesheet-row
          v-for="(project, index) in timesheet.projects"
          :key="project.customer.id"
          :project="timesheet.projects[index]"
          :readonly="timesheet.isReadonly"
          :selected-week="recordsState.selectedWeek"
          :value-formatter="timesheetFormatter"
          @update="timesheet.projects[index] = $event"
          @remove="deleteProject(timesheet.projects[index])"
        />

        <weekly-timesheet-totals-row
          :projects="timesheet.projects"
          :selected-week="recordsState.selectedWeek"
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
          <!-- disable inputs while saving? -->
          <weekly-timesheet-row
            :project="timesheet.travelProject"
            :readonly="timesheet.isReadonly"
            :selected-week="recordsState.selectedWeek"
            :value-formatter="kilometerFormatter"
            @update="timesheet.travelProject = $event"
          />
        </template>
      </weekly-timesheet>
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

import emptyTimesheet from "~/components/records/empty-timesheet.vue";
import navigationButtons from "~/components/records/navigation-buttons.vue";
import WeeklyTimesheetRow from "~/components/records/weekly-timesheet-row.vue";

import { generateValueFormatter } from "~/helpers/records";
import { createWeeklyTimesheet } from "~/helpers/timesheet";

export default defineComponent({
  components: { emptyTimesheet, navigationButtons, WeeklyTimesheetRow },
  setup() {
    const store = useStore<RootStoreState>();
    const user = computed(() => store.state.user.user);
    const recordsState = computed(() => store.state.records);

    store.dispatch("customers/getCustomers");
    store.dispatch("records/getRecords", {
      startDate: new Date(),
    });

    const selectableCustomers = computed(
      () => store.getters["customers/getSelectableCustomers"]
    );

    const timesheet = ref<WeeklyTimesheet>({
      isReadonly: false,
      projects: [],
      travelProject: null,
    });

    const addProject = (id: string) => {
      const allCustomers = store.state.customers.customers;
      const customer = allCustomers.find((x) => x.id === id) as Customer;

      timesheet.value.projects.push({
        customer,
        values: Array.from(Array(7), () => 0),
      });
    };

    const deleteProject = (project: TimesheetProject) => {
      store.dispatch("records/deleteProjectRecords", {
        week: recordsState.value.selectedWeek,
        project,
      });
    };

    watch(
      () => [
        recordsState.value.timeRecords,
        recordsState.value.travelRecords,
        recordsState.value.selectedWeek,
      ],
      () => {
        timesheet.value = createWeeklyTimesheet({
          week: recordsState.value.selectedWeek,
          timeRecords: recordsState.value.timeRecords,
          travelRecords: recordsState.value.travelRecords,
        });
      },
    );

    watch(
      () => timesheet.value,
      () => {
        store.dispatch("records/saveTimesheet", {
          week: recordsState.value.selectedWeek,
          timesheet: timesheet.value,
        });
      },
      { deep: true }
    );

    return {
      user,
      addProject,
      deleteProject,
      selectableCustomers,
      recordsState,
      timesheet,
      timesheetFormatter: generateValueFormatter(0, 24),
      kilometerFormatter: generateValueFormatter(0, 9999),
    };
  },
});
</script>