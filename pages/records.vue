<template>
  <div class="content-wrapper mt-5">
    <b-alert show variant="info" class="mb-3">
      To request leave, please visit
      <strong>
        <a
          href="https://bridge.hosted-tools.com/myprofile/absences"
          target="_blank"
          rel="noreferrer"
        >
          Bridge!
        </a>
      </strong>
    </b-alert>
    <employee-header
      v-if="isAdminView && employee"
      class="mb-5"
      :employee="employee"
    />

    <navigation-buttons
      class="mb-5"
      :selected-week="recordsState.selectedWeek"
      :is-admin-view="isAdminView"
      @previous="goToWeek('previous')"
      @next="goToWeek('next')"
      @current="goToWeek('current')"
    />

    <empty-timesheet
      v-if="!timesheet.projects.length"
      :is-admin-view="isAdminView"
      @copy-previous-week="copyPreviousWeek"
    />

    <template>
      <form action="javascript:void(0);">
        <template v-if="timesheet.projects.length">
          <weekly-timesheet :selected-week="recordsState.selectedWeek">
            <template #rows>
              <weekly-timesheet-row
                v-for="(project, index) in timesheet.projects"
                :key="`${project.customer.id}-${recordsState.selectedWeek[0].date}`"
                :project="timesheet.projects[index]"
                :readonly="!isAdminView && (isReadonly || project.isExternal)"
                :removeable="!isAdminView && !isReadonly && !project.isExternal"
                :selected-week="recordsState.selectedWeek"
                :value-formatter="timesheetFormatter"
                :employee="employee"
                @save="saveTimesheet(recordStatus.NEW)"
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
                @totals="setTotals"
              />
            </template>
          </weekly-timesheet>

          <template
            v-if="employee && (employee.standBy || isAdminView) && timesheet.standByProject"
          >
            <weekly-timesheet
              :selected-week="recordsState.selectedWeek"
              :active="!!employee.standBy"
              :title="'Stand-by hours'"
            >
              <template #rows>
                <weekly-timesheet-row
                  :key="recordsState.selectedWeek[0].date"
                  :project="timesheet.standByProject"
                  :readonly="!isAdminView && isReadonly"
                  :removable="false"
                  :selected-week="recordsState.selectedWeek"
                  :value-formatter="timesheetFormatter"
                  :employee="employee"
                  @change="hasUnsavedChanges = true"
                  @remove="deleteProject(timesheet.projects[index])"
                />
              </template>
            </weekly-timesheet>
          </template>

          <template
            v-if="employee && (employee.travelAllowance || isAdminView) && timesheet.travelProject"
          >
            <weekly-timesheet
              :selected-week="recordsState.selectedWeek"
              :active="!!employee.travelAllowance"
              :title="'Travel allowance'"
            >
              <template #rows>
                <weekly-timesheet-row
                  :key="recordsState.selectedWeek[0].date"
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
        </template>

        <template v-if="timesheet.leaveDays">
          <weekly-timesheet
            :selected-week="recordsState.selectedWeek"
            :title="'Leave days'"
          >
            <template #rows>
              <weekly-timesheet-row
                :key="recordsState.selectedWeek[0].date"
                :project="timesheet.leaveDays"
                :readonly="true"
                :removable="false"
                :selected-week="recordsState.selectedWeek"
                :value-formatter="timesheetFormatter"
                :employee="employee"
                @change="hasUnsavedChanges = true"
              />
            </template>
          </weekly-timesheet>
        </template>

        <div v-if="message || messages" class="mt-4">
          <comment-block v-if="!!message" :text="message" />
          <comment-block
            v-for="msg in messages"
            :key="msg.id"
            :text="msg.text"
            :date="msg.createdAt"
          />
        </div>

        <b-form-textarea
          v-if="(!isReadonly || message) && timesheet.projects.length "
          id="message-textarea"
          v-model="message"
          class="mt-4"
          placeholder="Add a comment here."
          rows="1"
          max-rows="4"
          :plaintext="!isAdminView && isReadonly"
          @change="hasUnsavedChanges = true"
          @blur="handleBlur"
        />
      </form>

      <weekly-timesheet-admin-footer
        v-if="isAdminView"
        class="mt-5"
        :has-unsaved-changes="hasUnsavedChanges"
        :is-saving="recordsState.isSaving"
        :last-saved="recordsState.lastSaved"
        :status="timesheetStatus"
        @save="saveTimesheet(recordStatus.PENDING)"
        @approve="saveTimesheet(recordStatus.APPROVED)"
        @unapprove="saveTimesheet(recordStatus.NEW)"
      />

      <weekly-timesheet-footer
        v-else
        class="mt-5"
        :has-unsaved-changes="hasUnsavedChanges"
        :is-saving="recordsState.isSaving"
        :last-saved="recordsState.lastSaved"
        :status="timesheetStatus"
        @save="saveTimesheet(recordStatus.NEW)"
        @submit="submitTimesheet"
        @unsubmit="saveTimesheet(recordStatus.NEW)"
      />

      <b-alert
        :show="timesheetDenyMessage !== ''"
        variant="danger"
        class="my-3"
      >
        {{ timesheetDenyMessage }}
      </b-alert>

      <b-modal
        id="deny-modal"
        centered
        title="Reason of denial"
        cancel-variant="danger"
        :ok-disabled="!reasonOfDenial"
        @hidden="reasonOfDenial = ''"
        @ok="handleDeny()"
      >
        <b-form-textarea
          id="textarea"
          v-model="reasonOfDenial"
          placeholder="Write a short description of the reason of denial and what the employee should do to fix it."
          rows="3"
        />
      </b-modal>
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
  ref,
} from "@nuxtjs/composition-api";

import EmployeeHeader from "~/components/app/employee-header.vue";
import EmptyTimesheet from "~/components/records/empty-timesheet.vue";
import NavigationButtons from "~/components/records/navigation-buttons.vue";
import SelectProjectDialog from "~/components/records/select-project-dialog.vue";
import WeeklyTimesheetFooter from "~/components/records/weekly-timesheet-footer.vue";
import WeeklyTimesheetRow from "~/components/records/weekly-timesheet-row.vue";
import WeeklyTimesheetTotalsRow from "~/components/records/weekly-timesheet-totals-row.vue";
import CommentBlock from "~/components/records/comment-block.vue";

import useTimesheet from "~/composables/useTimesheet";
import {recordStatus} from "~/helpers/record-status";

export default defineComponent({
  components: {
    EmployeeHeader,
    EmptyTimesheet,
    NavigationButtons,
    SelectProjectDialog,
    WeeklyTimesheetRow,
    WeeklyTimesheetFooter,
    WeeklyTimesheetTotalsRow,
    CommentBlock
  },
  middleware: ["isAuthenticated"],

  head: {},

  setup() {
    const router = useRouter();
    const store = useStore<RootStoreState>();
    const recordsState = computed(() => store.state.records);
    const isAdminView = router.currentRoute.name?.includes("timesheets");
    let totals: TimesheetTotals = {
      weekTotal: 0,
      expectedWeekTotal: 0,
      dayTotal: [],
    };

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

    const timesheet = useTimesheet(
      employeeId,
      Number(startTimestamp),
      selectedEmployee.value?.bridgeUid
    );

    const reasonOfDenial = ref("");

    const handleDeny = () => {
      if (!reasonOfDenial.value || !selectedEmployee.value) return;

      timesheet.denyTimesheet(selectedEmployee.value, reasonOfDenial.value);
    };

    const handleBlur = () => {
      timesheet.autoSave()
    };

    const selectableCustomers = computed(() => {
      const customers: Customer[] = store.state.customers.customers;
      const selectedCustomers = timesheet.timesheet.value.projects.map(
        (project) => project.customer.id
      );

      const selectableCustomers = customers.filter(
        (x: Customer) =>
          (selectedEmployee.value?.projects?.includes(x.id) &&
            !selectedCustomers?.includes(x.id) &&
            !x.archived) ||
          x.isDefault
      );

      return [
        {text: "Choose project", disabled: true},
        ...selectableCustomers.map((entry) => ({
          value: entry.id,
          text: entry.name,
        })),
      ];
    });


    const setTotals = (calculatedTotals: TimesheetTotals) => {
      totals = calculatedTotals;
    }

    const submitTimesheet = () => {
      let confirmation = true;

      if (totals.weekTotal > totals.expectedWeekTotal) {
        const difference = +(totals.weekTotal - totals.expectedWeekTotal).toFixed(2);
        confirmation = confirm(
          `You have filled in ${difference} more hour${difference !== 1 ? 's': ''} than the expected ${totals.expectedWeekTotal} hours a week. Is this correct?`
        );
      } else {
        // Only show this one if total hours is fine, but some days are too long
        const daysExceedingExpected = totals.dayTotal.filter(
          (hoursInDay, index) => {
            const weekendHours = !recordsState.value?.workScheme[index] && hoursInDay;
            const exceedsExpectedHours = recordsState.value?.workScheme[index]?.workHours;
            return hoursInDay > exceedsExpectedHours || weekendHours;
          },
        );

        if (daysExceedingExpected.length) confirmation = confirm(
          `You have filled in more hours than expected on some of the days. Is this correct?`
        );
      }

      if (!confirmation) return;

      timesheet.saveTimesheet(recordStatus.PENDING as TimesheetStatus);
    }

    return {
      employee: selectedEmployee,
      selectableCustomers,
      recordsState,
      recordStatus,
      isAdminView,
      reasonOfDenial,
      handleBlur,
      handleDeny,
      submitTimesheet,
      setTotals,
      ...timesheet,
    };
  },
});
</script>
