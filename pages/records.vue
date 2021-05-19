<template>
  <div class="content-wrapper mt-5">
    <employee-header
      v-if="isAdminView && employee"
      class="mb-5"
      :employee="employee"
    />

    <navigation-buttons
      class="mb-5"
      :selected-week="recordsState.selectedWeek"
      @previous="goToWeek('previous')"
      @next="goToWeek('next')"
      @current="goToWeek('current')"
    />

    <empty-timesheet
      v-if="!timesheet.projects.length"
      :is-admin-view="isAdminView"
      @copy-previous-week="copyPreviousWeek"
    />

    <template v-else>
      <weekly-timesheet :selected-week="recordsState.selectedWeek">
        <template #rows>
          <weekly-timesheet-row
            v-for="(project, index) in timesheet.projects"
            :key="project.customer.id"
            :project="timesheet.projects[index]"
            :readonly="!isAdminView && (isReadonly || project.isExternal)"
            :removeable="!isAdminView && !isReadonly && !project.isExternal"
            :selected-week="recordsState.selectedWeek"
            :value-formatter="timesheetFormatter"
            :employee="employee"
            @change="hasUnsavedChanges = true"
            @remove="deleteProject(timesheet.projects[index])"
          />

          <weekly-timesheet-totals-row
            :projects="timesheet.projects"
            :selected-week="recordsState.selectedWeek"
            :work-scheme="recordsState.workScheme"
            :show-add-project-button="
              !isReadonly && selectableCustomers.length > 0
            "
          />
        </template>
      </weekly-timesheet>

      <template
        v-if="employee && employee.travelAllowance && timesheet.travelProject"
      >
        <h3 class="mt-5 mb-3">Travel allowance</h3>

        <weekly-timesheet :selected-week="recordsState.selectedWeek">
          <template #rows>
            <weekly-timesheet-row
              :project="timesheet.travelProject"
              :readonly="!isAdminView && isReadonly"
              :removable="false"
              :selected-week="recordsState.selectedWeek"
              :value-formatter="kilometerFormatter"
              :employee="employee"
              @change="hasUnsavedChanges = true"
            />
          </template>
        </weekly-timesheet>
      </template>

      <b-form-textarea
        v-if="!isReadonly || message"
        id="message-textarea"
        v-model="message"
        class="mt-4"
        placeholder="Add a comment here."
        rows="1"
        max-rows="4"
        :plaintext="!isAdminView && isReadonly"
        @change="hasUnsavedChanges = true"
      />

      <weekly-timesheet-admin-footer
        v-if="isAdminView"
        class="mt-5"
        :has-unsaved-changes="hasUnsavedChanges"
        :is-saving="recordsState.isSaving"
        :last-saved="recordsState.lastSaved"
        :status="timesheetStatus"
        @save="saveTimesheet(recordStatus.PENDING)"
        @deny="saveTimesheet(recordStatus.DENIED)"
        @approve="saveTimesheet(recordStatus.APPROVED)"
      />

      <weekly-timesheet-footer
        v-else
        class="mt-5"
        :has-unsaved-changes="hasUnsavedChanges"
        :is-saving="recordsState.isSaving"
        :last-saved="recordsState.lastSaved"
        :status="timesheetStatus"
        @save="saveTimesheet(recordStatus.NEW)"
        @submit="saveTimesheet(recordStatus.PENDING)"
        @unsubmit="saveTimesheet(recordStatus.NEW)"
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
  useRouter,
  useStore,
  useMeta,
} from "@nuxtjs/composition-api";

import EmployeeHeader from "~/components/app/employee-header.vue";
import EmptyTimesheet from "~/components/records/empty-timesheet.vue";
import NavigationButtons from "~/components/records/navigation-buttons.vue";
import SelectProjectDialog from "~/components/records/select-project-dialog.vue";
import WeeklyTimesheetFooter from "~/components/records/weekly-timesheet-footer.vue";
import WeeklyTimesheetRow from "~/components/records/weekly-timesheet-row.vue";
import WeeklyTimesheetTotalsRow from "~/components/records/weekly-timesheet-totals-row.vue";

import useTimesheet from "~/composables/useTimesheet";
import { recordStatus } from "~/helpers/record-status";

export default defineComponent({
  components: {
    EmployeeHeader,
    EmptyTimesheet,
    NavigationButtons,
    SelectProjectDialog,
    WeeklyTimesheetRow,
    WeeklyTimesheetFooter,
    WeeklyTimesheetTotalsRow,
  },
  middleware: ["isAuthenticated"],

  head: {},

  setup() {
    const router = useRouter();
    const store = useStore<RootStoreState>();
    const recordsState = computed(() => store.state.records);
    const isAdminView = router.currentRoute.name?.includes("timesheets");

    store.dispatch("employees/getEmployees");
    store.dispatch("customers/getCustomers");

    if (isAdminView && !store.getters["employee/isEmployeeAdmin"]) {
      return router.replace("/records");
    }

    const employeeId = isAdminView
      ? router.currentRoute.params.employee_id
      : store.state.employee.employee!.id;

    const selectedEmployee = computed(() => {
      const employees = store.state.employees.employees;

      return isAdminView
        ? employees.find((x) => x.id === employeeId)
        : store.state.employee.employee;
    });

    const pageTitle = computed(() => {
      if (!isAdminView) return undefined;

      return selectedEmployee.value
        ? `Timesheets - ${selectedEmployee.value?.name}`
        : "Timesheets";
    });

    useMeta(() => ({
      title: pageTitle.value,
    }));

    const startTimestamp = router.currentRoute.params.start_timestamp;

    const timesheet = useTimesheet(employeeId, Number(startTimestamp));

    const selectableCustomers = computed(() => {
      const customers = store.state.customers.customers;
      const selectedCustomers = timesheet.timesheet.value.projects.map(
        (project) => project.customer.id
      );

      const selectableCustomers = customers.filter(
        (x) =>
          selectedEmployee.value?.projects.includes(x.id) &&
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

    return {
      employee: selectedEmployee,
      selectableCustomers,
      recordsState,
      recordStatus,
      isAdminView,
      ...timesheet,
    };
  },
});
</script>
