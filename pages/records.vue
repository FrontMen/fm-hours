<template>
  <div class="content-wrapper mt-5">
    <user-header v-if="isAdminView && user" class="mb-5" :user="user" />

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
            :readonly="
              !isAdminView && (timesheet.isReadonly || project.isExternal)
            "
            :removeable="
              !isAdminView && !timesheet.isReadonly && !project.isExternal
            "
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

      <template v-if="user && user.travelAllowance && timesheet.travelProject">
        <h3 class="my-5">Travel allowance</h3>

        <weekly-timesheet :selected-week="recordsState.selectedWeek">
          <template #rows>
            <weekly-timesheet-row
              :project="timesheet.travelProject"
              :readonly="!isAdminView && timesheet.isReadonly"
              :removable="false"
              :selected-week="recordsState.selectedWeek"
              :value-formatter="kilometerFormatter"
              @change="hasUnsavedChanges = true"
            />
          </template>
        </weekly-timesheet>
      </template>

      <weekly-timesheet-admin-footer
        v-if="isAdminView"
        class="mt-5"
        :has-unsaved-changes="hasUnsavedChanges"
        :is-saving="recordsState.isSaving"
        :last-saved="recordsState.lastSaved"
        :status="timesheet.status"
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
        :status="timesheet.status"
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
} from "@nuxtjs/composition-api";

import UserHeader from "~/components/app/user-header.vue";
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
    UserHeader,
    EmptyTimesheet,
    NavigationButtons,
    SelectProjectDialog,
    WeeklyTimesheetRow,
    WeeklyTimesheetFooter,
    WeeklyTimesheetTotalsRow,
  },
  middleware: ["isAuthenticated"],
  setup() {
    const router = useRouter();
    const store = useStore<RootStoreState>();
    const recordsState = computed(() => store.state.records);
    const isAdminView = router.currentRoute.name?.includes("timesheets");

    store.dispatch("users/getUsers");
    store.dispatch("customers/getCustomers");

    if (isAdminView && !store.getters["user/isUserAdmin"]) {
      return router.replace("/records");
    }

    const userId = isAdminView
      ? router.currentRoute.params.user_id
      : store.state.user.user!.id;

    const selectedUser = computed(() => {
      const users = store.state.users.users;

      return isAdminView
        ? users.find((x) => x.id === userId)
        : store.state.user.user;
    });

    const timesheet = useTimesheet(userId);

    const selectableCustomers = computed(() => {
      const customers = store.state.customers.customers;
      const selectedCustomers = timesheet.timesheet.value.projects.map(
        (project) => project.customer.id
      );

      const selectableCustomers = customers.filter(
        (x) =>
          selectedUser.value?.projects.includes(x.id) &&
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
      user: selectedUser,
      selectableCustomers,
      recordsState,
      recordStatus,
      isAdminView,
      ...timesheet,
    };
  },
});
</script>
