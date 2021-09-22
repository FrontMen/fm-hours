<i18n lang="yaml">
  en:
    workschemeError: "Could not get workschema data. Holidays, leave, or total hours will not be shown correctly, but you can still fill in and submit your timesheet"
    leaveRequest: "To request leave, please visit"
    bridge: "Bridge"
    standByHours: "Stand-by hours"
    leaveDay: "Leave days"
    addComment: "Add a comment here."
    employeeError: "Selected employee is not found"
  nl:
    workschemeError: "Kan het werkschema, vakantiedagen en totalen niet ophalen van de server. Je kan nog steeds je uren registreren."
    leaveRequest: "Voor verlof"
    bridge: "Bridge"
    standByHours: "Stand-by uren"
    leaveDay: "Verlofdagen"
    addComment: "Notitie toevoegen"
    employeeError: "Geselecteerde medewerker is niet gevonden"
</i18n>
<template>
  <div class="content-wrapper mt-5">
    <h6>selectedEmployee:</h6>
    <p>{{ employee }}</p>

    <h6>timesheet:</h6>
    <p>{{ timesheet }}</p>

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

    <empty-timesheet
      v-if="!timesheet.projects.length"
      @copy-previous-week="copyPreviousWeek"
    />

    <select-project-dialog
      :projects="selectableCustomers"
      @project-selected="addProject"
    />

    <form action="javascript:void(0);">
      <template v-if="timesheet.projects.length">
        <weekly-timesheet :selected-week="recordsState.selectedWeek">
          <template #rows>
            <weekly-timesheet-row
              v-for="(project, index) in timesheet.projects"
              :key="`${project.customer.id}-${recordsState.selectedWeek[0].date}`"
              :project="timesheet.projects[index]"
              :readonly="isReadonly || project.isExternal"
              :removeable="!isReadonly && !project.isExternal"
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
                :readonly="isReadonly"
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
                :readonly="isReadonly"
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
        v-if="!isReadonly && timesheet.projects.length"
        id="message-textarea"
        v-model="messageInput"
        class="mt-4"
        :placeholder="$t('addComment')"
        rows="1"
        max-rows="4"
        @change="hasUnsavedChanges = true"
      />
    </form>

    <weekly-timesheet-footer
      class="mt-5"
      :has-unsaved-changes="hasUnsavedChanges"
      :is-saving="recordsState.isSaving"
      :last-saved="recordsState.lastSaved"
      :status="timesheetStatus"
      @save="saveTimesheet(recordStatus.NEW)"
      @submit="submitTimesheet"
      @unsubmit="saveTimesheet(recordStatus.NEW)"
    />

    <b-alert :show="timesheetDenyMessage !== ''" variant="danger" class="my-3">
      {{ timesheetDenyMessage }}
    </b-alert>
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
import { startOfISOWeek, subDays } from 'date-fns';
import { buildWeek, getDayOnGMT } from '~/helpers/dates';
import { uuidv4 } from '~/helpers/helpers';
import {
  createWeeklyTimesheet,
  timesheetFormatter,
  kilometerFormatter,
  createLeaveProject,
} from '~/helpers/timesheet';
import { recordStatus } from '~/helpers/record-status';

export default defineComponent({
  middleware: ['isAuthenticated'],

  setup() {
    const { i18n, params } = useContext();
    const store = useStore<RootStoreState>();
    const hasUnsavedChanges = ref<Boolean>(false);
    const unsavedWeeklyTimesheet = ref<WeeklyTimesheet>();
    const messageInput = ref('');
    const showEmployeeError = ref(false);
    const { employee_id: employeeId, start_timestamp: startTimestamp } =
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

    const isReadonly = computed(
      () =>
        timesheetStatus.value === recordStatus.APPROVED ||
        timesheetStatus.value === recordStatus.PENDING
    );

    const hasRestDayHours = computed(() => {
      return timesheet.value.projects.reduce((_, project) => {
        return project.values.reduce((acc, value, index) => {
          if (!value) return acc;

          const day = recordsState.value.selectedWeek[index];

          return index === 5 || index === 6 || day.isHoliday || day.isLeaveDay;
        }, false);
      }, false);
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
      store.dispatch('records/goToWeek', { bridgeUid, to });
    };

    const copyPreviousWeek = () => {
      const startDate = new Date(
        getDayOnGMT(recordsState.value.selectedWeek[0].date)
      );
      const prevStartDate = subDays(startDate, 7);
      const previousWeek = buildWeek(startOfISOWeek(prevStartDate));

      const previousWeekTimesheet = createWeeklyTimesheet({
        week: previousWeek,
        leaveDays: createLeaveProject(
          recordsState.value.selectedWeek,
          recordsState.value.workScheme
        ),
        timeRecords: recordsState.value.timeRecords,
        travelRecords: recordsState.value.travelRecords,
        workScheme: recordsState.value.workScheme,
        standByRecords: recordsState.value.standByRecords,
      });

      const newTimesheet = {
        projects: previousWeekTimesheet.projects
          .filter((project) => {
            const projectArchived = customers.value.customers.find(
              (customer) => customer.id === project.customer.id
            )?.archived;
            if (projectArchived) {
              alert(
                `${project.customer.name} is already archived. We wont copy it to new timesheet`
              );
            }
            return !projectArchived;
          })
          .map((project) => ({
            ...project,
            ids: new Array(7).fill(null),
          })),
        leaveDays: previousWeekTimesheet.leaveDays,
        travelProject: {
          ...previousWeekTimesheet.travelProject!,
          ids: new Array(7).fill(null),
        },
        standByProject: {
          ...previousWeekTimesheet.standByProject!,
          ids: new Array(7).fill(null),
        },
      };

      timesheet.value = newTimesheet;
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
        { text: i18n.t('chooseProject'), disabled: true },
        ...selectable.map((entry) => ({
          value: entry.id,
          text: entry.name,
        })),
      ];
    });

    const saveTimesheet = (
      newTimesheetStatus: TimesheetStatus,
      denialMessage?: string
    ) => {
      if (
        newTimesheetStatus === timesheetStatus.value &&
        !hasUnsavedChanges.value
      )
        return;

      if (newTimesheetStatus === recordStatus.NEW && hasRestDayHours.value) {
        const confirmation = confirm(
          'You have add hours on weekends or holidays, are you sure you want to save this timesheet?'
        );

        if (!confirmation) return;
      }

      unsavedWeeklyTimesheet.value = undefined;

      console.log('saving timesheet: ', employeeId);

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
          ...(message.value && { message: message.value }),
        }
        : {
          employeeId,
          date: new Date(recordsState.value.selectedWeek[0].date).getTime(),
          status: newTimesheetStatus,
          reasonOfDenial,
          messages: newMessages,
          ...(message.value && { message: message.value }),
        };

      store.dispatch('timesheets/saveTimesheet', newTimesheet);
    };

    const deleteProject = (project: TimesheetProject) => {
      store.dispatch('records/deleteProjectRecords', {
        week: recordsState.value.selectedWeek,
        project,
        employeeId,
      });

      unsavedWeeklyTimesheet.value = {
        projects: timesheet.value.projects.filter(
          (proj) => proj.customer.id !== project.customer.id
        ),
        leaveDays: timesheet.value.leaveDays,
        travelProject: timesheet.value.travelProject,
        standByProject: timesheet.value.standByProject,
      };

      // if deleting the last project, clear the timesheet
      if (timesheet.value.projects.length <= 1) {
        store.dispatch('timesheets/deleteTimesheet', {
          timesheetId: timesheetState.value?.timesheets[0]?.id,
        });
        messageInput.value = '';
      }

      if (!unsavedWeeklyTimesheet.value?.projects.length) {
        hasUnsavedChanges.value = false;
      }
    };

    const setTotals = (calculatedTotals: TimesheetTotals) => {
      totals = calculatedTotals;
    };

    const submitTimesheet = () => {
      let confirmation = true;

      if (totals.weekTotal > totals.expectedWeekTotal && !showBridgeError) {
        const difference = +(
          totals.weekTotal - totals.expectedWeekTotal
        ).toFixed(2);
        confirmation = confirm(
          `${difference === 1
            ? i18n.t('weekError', {
              n: difference,
              expected: totals.expectedWeekTotal,
            })
            : i18n.t('weekErrors', {
              n: difference,
              expected: totals.expectedWeekTotal,
            })
          }`
        );
      } else {
        // Only show this one if total hours is fine, but some days are too long
        const daysExceedingExpected = totals.dayTotal.filter(
          (hoursInDay, index) => {
            const weekendHours =
              !recordsState.value?.workScheme[index] && hoursInDay;
            const exceedsExpectedHours =
              recordsState.value?.workScheme[index]?.workHours;
            return hoursInDay > exceedsExpectedHours || weekendHours;
          }
        );

        if (daysExceedingExpected.length && !showBridgeError)
          confirmation = confirm(i18n.t('dayError') as string);
      }

      if (!confirmation) return;

      saveTimesheet(recordStatus.PENDING as TimesheetStatus);
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
      isReadonly,
      messages,
      message,
      timesheetDenyMessage,
      totals,
      showStandby,
      showTravel,
      messageInput,
      hasUnsavedChanges,
      goToWeek,
      copyPreviousWeek,
      addProject,
      saveTimesheet,
      timesheetFormatter: timesheetFormatter(24),
      kilometerFormatter: kilometerFormatter(0, 9999),
      deleteProject,
      setTotals,
      submitTimesheet,
    };
  },

  head: {},
});
</script>
