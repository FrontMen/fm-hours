<i18n lang="yaml">
  en:
    workschemeError: "Could not get workschema data. Holidays, leave, or total hours will not be shown correctly, but you can still fill in and submit your timesheet"
    leaveRequest: "To request leave, please visit"
    bridge: "Bridge"
    standByHours: "Stand-by hours"
    leaveDay: "Leave days"
    addComment: "Add a comment here."
    employeeError: "Selected employee is not found"
    denialReason: "Reason of denial"
    denialReasonPlaceholder: "Write a short description of the reason of denial and what the employee should do to fix it."
  nl:
    workschemeError: "Kan het werkschema, vakantiedagen en totalen niet ophalen van de server. Je kan nog steeds je uren registreren."
    leaveRequest: "Voor verlof"
    bridge: "Bridge"
    standByHours: "Stand-by uren"
    leaveDay: "Verlofdagen"
    addComment: "Notitie toevoegen"
    employeeError: "Geselecteerde medewerker is niet gevonden"
    denialReason: "Reden van afwijzing"
    denialReasonPlaceholder: "Schrijf een korte notitie van de reden van afkeuren. Dit wordt getoond aan de medewerker."
</i18n>
<template>
  <div class="content-wrapper mt-5">
    <b-alert
      :show="showBridgeError || showEmployeeError"
      dismissible
      variant="warning"
      class="mb-3"
    >
      {{ showBridgeError ? $t('workschemeError') : $t('employeeError') }}
    </b-alert>

    <navigation-buttons
      class="mb-5"
      :selected-week="recordsState.selectedWeek"
      @previous="goToWeek('previous')"
      @next="goToWeek('next')"
      @current="goToWeek('current')"
    />

    <form action="javascript:void(0);">
      <template v-if="timesheet.projects.length">
        <weekly-timesheet :selected-week="recordsState.selectedWeek">
          <template #rows>
            <weekly-timesheet-row
              v-for="(project, index) in timesheet.projects"
              :key="`${project.customer.id}-${recordsState.selectedWeek[0].date}`"
              :project="timesheet.projects[index]"
              :removeable="false"
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
              :show-add-project-button="false"
              @totals="setTotals"
            />
          </template>
        </weekly-timesheet>

        <template v-if="showStandby">
          <weekly-timesheet
            :selected-week="recordsState.selectedWeek"
            :active="!!employee.standBy"
            :title="$t('standByHours')"
          >
            <template #rows>
              <weekly-timesheet-row
                :key="recordsState.selectedWeek[0].date"
                :project="timesheet.standByProject"
                :removable="false"
                :selected-week="recordsState.selectedWeek"
                :value-formatter="timesheetFormatter"
                :employee="employee"
              />
            </template>
          </weekly-timesheet>
        </template>

        <template v-if="showTravel">
          <weekly-timesheet
            :selected-week="recordsState.selectedWeek"
            :active="!!employee.travelAllowance"
            :title="$t('travelAllowance')"
          >
            <template #rows>
              <weekly-timesheet-row
                :key="recordsState.selectedWeek[0].date"
                :project="timesheet.travelProject"
                :removable="false"
                :selected-week="recordsState.selectedWeek"
                :value-formatter="kilometerFormatter"
                :employee="employee"
              />
            </template>
          </weekly-timesheet>
        </template>
      </template>

      <!-- TODO: Setup the intracto APIs before uncommenting -->
      <!-- <template v-if="timesheet.leaveDays">
        <weekly-timesheet
          :selected-week="recordsState.selectedWeek"
          :title="$t('leaveDay')"
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
      </template>-->

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
        v-if="timesheet.projects.length"
        id="message-textarea"
        v-model="messageInput"
        class="mt-4"
        :placeholder="$t('addComment')"
        rows="1"
        max-rows="4"
        @change="hasUnsavedChanges = true"
      />
    </form>

    <weekly-timesheet-admin-footer
      class="mt-5"
      :has-unsaved-changes="hasUnsavedChanges"
      :is-saving="recordsState.isSaving"
      :last-saved="recordsState.lastSaved"
      :status="timesheetStatus"
      @save="saveTimesheet(recordStatus.PENDING)"
      @approve="saveTimesheet(recordStatus.APPROVED)"
      @unapprove="saveTimesheet(recordStatus.NEW)"
      @reminder="handleReminder"
    />

    <b-alert :show="timesheetDenyMessage !== ''" variant="danger" class="my-3">
      {{ timesheetDenyMessage }}
    </b-alert>

    <b-modal
      id="deny-modal"
      centered
      :title="$t('denialReason')"
      cancel-variant="danger"
      :ok-disabled="!reasonOfDenial"
      :ok-title="$t('ok')"
      :cancel-title="$t('cancel')"
      @hidden="reasonOfDenial = ''"
      @ok="handleDeny"
    >
      <b-form-textarea
        id="textarea"
        v-model="reasonOfDenial"
        :placeholder="$t('denialReasonPlaceholder')"
        rows="3"
      />
    </b-modal>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  //   useRouter,
  useStore,
  watch,
  useMeta,
  useContext,
  ref,
} from '@nuxtjs/composition-api';

import {
  createWeeklyTimesheet,
  timesheetFormatter,
  kilometerFormatter,
  createLeaveProject,
} from '~/helpers/timesheet';
import {recordStatus} from '~/helpers/record-status';
import {uuidv4} from '~/helpers/helpers';
import {buildEmailData} from '~/helpers/email';

export default defineComponent({
  middleware: ['isAuthenticated'],

  setup() {
    const {i18n, params} = useContext();
    const store = useStore<RootStoreState>();
    const hasUnsavedChanges = ref<Boolean>(false);
    const unsavedWeeklyTimesheet = ref<WeeklyTimesheet>();
    const messageInput = ref('');
    const showEmployeeError = ref(false);
    const reasonOfDenial = ref('');
    const {employee_id: employeeId, start_timestamp: startTimestamp} =
      params.value;

    const customers = computed(() => store.state.customers);
    const recordsState = computed(() => store.state.records);
    const timesheetState = computed(() => store.state.timesheets);
    const selectedEmployee = computed(() => {
      showEmployeeError.value = false;
      const employee = store.state.employees.employees.find(
        (employee: Employee) => employee.id === employeeId
      );
      if (!employee) {
        showEmployeeError.value = true;
        return {} as Employee;
      }
      return employee;
    });
    const pageTitle = computed(
      () => `${i18n.t('timesheets')} - ${selectedEmployee.value?.name}`
    );
    const message = computed(
      () => timesheetState.value?.timesheets[0]?.message
    );
    const showBridgeError = computed(() => {
      return !!store.state.records.errorMessageWorkscheme;
    });
    const timesheetDenyMessage = computed(() =>
      timesheetState.value.timesheets[0]
        ? timesheetState.value.timesheets[0].reasonOfDenial
        : ''
    );
    const timesheetStatus = computed(() => {
      return timesheetState.value.timesheets[0]
        ? timesheetState.value.timesheets[0].status
        : (recordStatus.NEW as TimesheetStatus);
    });

    const showStandby = computed(
      () =>
        selectedEmployee &&
        selectedEmployee.value?.standBy &&
        timesheet.value.standByProject
    );

    const showTravel = computed(
      () =>
        selectedEmployee &&
        selectedEmployee.value?.travelAllowance &&
        timesheet.value.travelProject
    );

    const timesheet = ref<WeeklyTimesheet>({
      projects: [],
      leaveDays: null,
      travelProject: null,
      standByProject: null,
    });

    const messages = ref<Message[]>(
      timesheetState.value?.timesheets[0]?.messages || []
    );

    let bridgeUid: string | undefined;
    let totals: TimesheetTotals = {
      weekTotal: 0,
      expectedWeekTotal: 0,
      dayTotal: [],
    };

    watch([selectedEmployee], () => {
      bridgeUid = selectedEmployee.value.bridgeUid;
      const startDate = startTimestamp
        ? new Date(parseInt(startTimestamp))
        : new Date();

      store.dispatch('records/getRecords', {
        employeeId,
        startDate,
        bridgeUid,
      });
    });

    watch(
      () => [
        recordsState.value.selectedWeek,
        recordsState.value.timeRecords,
        recordsState.value.travelRecords,
        recordsState.value.standByRecords,
      ],
      () => {
        const date = new Date(
          recordsState.value.selectedWeek[0].date
        ).getTime();

        store.dispatch('timesheets/getTimesheets', {
          employeeId,
          date,
        });

        const newTimesheet = createWeeklyTimesheet({
          week: recordsState.value.selectedWeek,
          leaveDays: createLeaveProject(
            recordsState.value.selectedWeek,
            recordsState.value.workScheme
          ),
          timeRecords: recordsState.value.timeRecords,
          travelRecords: recordsState.value.travelRecords,
          standByRecords: recordsState.value.standByRecords,
          workScheme: recordsState.value.workScheme,
        });

        timesheet.value = unsavedWeeklyTimesheet.value
          ? unsavedWeeklyTimesheet.value
          : newTimesheet;
      }
    );

    useMeta(() => ({
      title: pageTitle.value,
    }));

    store.dispatch('employees/getEmployees');
    store.dispatch('customers/getCustomers');

    const goToWeek = (to: 'current' | 'previous' | 'next') => {
      if (hasUnsavedChanges.value) {
        confirm(
          'You have unsaved changes, are you sure you want to switch to another week?'
        );
      }

      unsavedWeeklyTimesheet.value = undefined;
      hasUnsavedChanges.value = false;
      messageInput.value = '';
      store.dispatch('records/goToWeek', {bridgeUid, to});
    };

    const selectableCustomers = computed(() => {
      const currentIds = timesheet.value.projects.map(
        (project) => project.customer.id
      );

      const selectable = customers.value.customers.filter(
        (customer: Customer) =>
          (selectedEmployee.value?.projects?.includes(customer.id) &&
            !currentIds?.includes(customer.id) &&
            !customer.archived) ||
          customer.isDefault
      );

      return [
        {text: i18n.t('chooseProject'), disabled: true},
        ...selectable.map((entry) => ({
          value: entry.id,
          text: entry.name,
        })),
      ];
    });

    const setTotals = (calculatedTotals: TimesheetTotals) => {
      totals = calculatedTotals;
    };

    const saveTimesheet = (
      newTimesheetStatus: TimesheetStatus,
      denialMessage?: string
    ) => {
      if (
        newTimesheetStatus === timesheetStatus?.value &&
        !hasUnsavedChanges.value
      )
        return;

      unsavedWeeklyTimesheet.value = undefined;

      store.dispatch('records/saveTimesheet', {
        employeeId,
        week: recordsState.value.selectedWeek,
        timesheet: timesheet.value,
      });

      let reasonOfDenial = '';
      if (timesheetState.value.timesheets[0]) {
        reasonOfDenial = timesheetState.value.timesheets[0].reasonOfDenial;
      }
      if (newTimesheetStatus === recordStatus.DENIED && denialMessage) {
        reasonOfDenial = denialMessage;
      } else if (newTimesheetStatus === recordStatus.PENDING) {
        reasonOfDenial = '';
      }

      const createNewMessage = (text: string): Message => ({
        id: uuidv4(),
        createdAt: new Date().getTime(),
        text,
      });

      const newMessages = messageInput.value
        ? [...messages.value, createNewMessage(messageInput.value)]
        : [...messages.value];

      const newTimesheet = timesheetState.value.timesheets[0]
        ? {
            ...timesheetState.value.timesheets[0],
            status: newTimesheetStatus,
            reasonOfDenial,
            messages: newMessages,
            ...(message.value && {message: message.value}),
          }
        : {
            employeeId,
            date: new Date(recordsState.value.selectedWeek[0].date).getTime(),
            status: newTimesheetStatus,
            reasonOfDenial,
            messages: newMessages,
            ...(message.value && {message: message.value}),
          };

      store.dispatch('timesheets/saveTimesheet', newTimesheet);

      hasUnsavedChanges.value = false;
    };

    const denyTimesheet = (employee: Employee, denialMessage: string) => {
      unsavedWeeklyTimesheet.value = undefined;
      const selectedTimesheet = timesheetState.value.timesheets[0];

      if (
        !selectedTimesheet ||
        selectedTimesheet.status !== recordStatus.PENDING
      )
        return;

      store.dispatch('records/saveTimesheet', {
        employeeId,
        week: recordsState.value.selectedWeek,
        timesheet: timesheet.value,
      });

      const newTimesheet = {
        ...selectedTimesheet,
        status: recordStatus.DENIED,
        denialMessage,
        message: message.value || '',
      };

      const emailData = buildEmailData({
        employee,
        week: recordsState.value.selectedWeek,
        denialMessage,
      });

      store.dispatch('timesheets/denyTimesheet', {
        timesheet: newTimesheet,
        emailData,
      });

      hasUnsavedChanges.value = false;
    };

    const handleDeny = () => {
      if (!reasonOfDenial.value || !selectedEmployee.value) return;
      denyTimesheet(selectedEmployee.value, reasonOfDenial.value);
    };

    const handleReminder = () => {
      if (!selectedEmployee.value) return;
      const startDate = new Date(
        recordsState.value?.selectedWeek[0].date
      ).getTime();
      store.dispatch('timesheets/emailReminder', {
        employee: selectedEmployee.value,
        startDate,
      });
    };

    return {
      employee: selectedEmployee,
      recordsState,
      timesheetState,
      timesheet,
      showBridgeError,
      showEmployeeError,
      selectableCustomers,
      timesheetStatus,
      messages,
      message,
      timesheetDenyMessage,
      totals,
      showStandby,
      showTravel,
      messageInput,
      hasUnsavedChanges,
      reasonOfDenial,
      recordStatus,
      goToWeek,
      timesheetFormatter: timesheetFormatter(24),
      kilometerFormatter: kilometerFormatter(0, 9999),
      setTotals,
      handleDeny,
      handleReminder,
      saveTimesheet,
    };
  },

  head: {},
});
</script>
