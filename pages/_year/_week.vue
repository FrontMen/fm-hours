<i18n lang="yaml">
  en:
    workschemeError: "Could not get workschema data. Holidays, leave, or total hours will not be shown correctly, but you can still fill in and submit your timesheet"
    leaveRequest: "To request leave, please visit"
    bridge: "Bridge"
    standByHours: "Stand-by hours"
    leaveDay: "Leave days"
    addComment: "Add a comment here."
  nl:
    workschemeError: "Kan het werkschema, vakantiedagen en totalen niet ophalen van de server. Je kan nog steeds je uren registreren."
    leaveRequest: "Voor verlof"
    bridge: "Bridge"
    standByHours: "Stand-by uren"
    leaveDay: "Verlofdagen"
    addComment: "Notitie toevoegen"
</i18n>
<template>
  <div class="mt-5 content-wrapper">
    <b-alert :show="showBridgeError" dismissible variant="warning" class="mb-3">
      {{ $t('workschemeError') }}
    </b-alert>

    <navigation-buttons class="mb-5" :start-date="startDate" />

    <form action="javascript:void(0);">
      <weekly-timesheet :selected-week="timesheet.week">
        <template #rows>
          <weekly-timesheet-row-hours
            v-for="(project) in timesheet.projects"
            :key="project.customer.id"
            :project="project"
            :readonly="isReadonly || project.isExternal"
            :selected-week="timesheet.week"
            :employee="employee"
            @save="saveTimesheet(recordStatus.NEW)"
            @change="hasUnsavedChanges = true"
          />

          <weekly-timesheet-row-hours
            v-if="showStandby"
            :project="timesheet.standByProject"
            :readonly="isReadonly"
            :selected-week="timesheet.week"
            :employee="employee"
            @change="hasUnsavedChanges = true"
          />

          <weekly-timesheet-row-kilometer
            v-if="showTravel"
            :project="timesheet.travelProject"
            :readonly="isReadonly"
            :selected-week="timesheet.week"
            :employee="employee"
            @change="hasUnsavedChanges = true"
          />

          <weekly-timesheet-totals-row
            :projects="timesheet.projects"
            :selected-week="timesheet.week"
            :work-scheme="timesheet.workScheme"
            @totals="setTotals"
          />
        </template>
      </weekly-timesheet>

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
  ref,
  useContext,
  useMeta,
  useRouter,
  useStore,
  watch,
} from '@nuxtjs/composition-api';
import {startOfISOWeek} from "date-fns";
import {uuidv4} from '~/helpers/helpers';
import {createWeeklyTimesheet,} from '~/helpers/timesheet';
import {recordStatus} from '~/helpers/record-status';
import {buildWeek, getDateOfISOWeek} from '~/helpers/dates';

export default defineComponent({
  middleware: ['isAuthenticated'],

  setup() {
    const {i18n, app} = useContext();
    const router = useRouter();
    const store = useStore<RootStoreState>();
    const hasUnsavedChanges = ref<Boolean>(false);
    const messageInput = ref('');
    const employee = computed(() => store.state.employee.employee);
    const projects = computed(() => store.state.employee.projects);
    const recordsState = computed(() => store.state.records);

    const pageTitle = computed(() =>
      `${i18n.t('timesheets')} - ${employee.value?.name}`
    );

    const message = computed(
      () => timesheet.value.info?.message
    );
    const showBridgeError = computed(() => {
      return !!store.state.records.errorMessageWorkscheme;
    });
    const timesheetDenyMessage = computed(
      () => timesheet.value.info?.reasonOfDenial || ''
    );
    const timesheetStatus = computed(() => {
      return timesheet.value.info ? timesheet.value.info.status: (recordStatus.NEW as TimesheetStatus);
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

          const day = timesheet.value.week[index];

          return index === 5 || index === 6 || day.isHoliday || day.isLeaveDay;
        }, false);
      }, false);
    });

    const showStandby = computed(
      () =>
        employee &&
        employee.value?.standBy &&
        timesheet.value.standByProject
    );

    const showTravel = computed(
      () =>
        employee &&
        employee.value?.travelAllowance &&
        timesheet.value.travelProject
    );

    const { year, week } = router.currentRoute.params;

    // TODO: figure out how to get Monday (1) instead of Wednesday (3) without screwing up the timezone
    // const startDate = computed(() => getDateOfISOWeek(parseInt(year.value, 10), parseInt(week.value, 10), 3));
    const startDate = getDateOfISOWeek(parseInt(year, 10), parseInt(week, 10), 3);

    const timesheet = ref<WeeklyTimesheet>({
      info: null,
      week: [],
      projects: [],
      leaveDays: null,
      travelProject: null,
      standByProject: null,
      workScheme: []
    });

    const messages = ref<Message[]>(
      timesheet.value.info?.messages || []
    );

    const totals = ref<TimesheetTotals>({
      weekTotal: 0,
      expectedWeekTotal: 0,
      dayTotal: [],
    });

    const getTimesheet = async () => {
      if(!employee.value) return;

      const employeeId = employee.value.id;

      const workWeek = buildWeek(startOfISOWeek(startDate));

      const startEpoch = new Date(workWeek[0].date).getTime()
      const range = {
        startDate: new Date(workWeek[0].date).getTime().toString(),
        endDate: new Date(workWeek[6].date).getTime().toString()
      }

      // TODO: get single timesheet
      const [timeRecords, standByRecords, travelRecords, timesheets] = await Promise.all([
        app.$timeRecordsService.getEmployeeRecords<TimeRecord>({employeeId, ...range}),
        app.$timeRecordsService.getEmployeeRecords<StandbyRecord>({employeeId, ...range},'standby_records'),
        app.$travelRecordsService.getEmployeeRecords({employeeId, ...range}),
        app.$timesheetsService.getTimesheets({employeeId, date: startEpoch})
      ]);

      // TODO: implement worksheme logic
      const workScheme: WorkScheme[] = [];

      // Combine everything in a single timesheet
      timesheet.value = createWeeklyTimesheet({
        sheet: timesheets[0],
        week: workWeek,
        projects: projects.value,
        timeRecords,
        travelRecords,
        standByRecords,
        workScheme,
      });
    }

    watch(employee, () => {
      getTimesheet();
    }, { immediate: true });

    const saveTimesheet = (
      newTimesheetStatus: TimesheetStatus,
      denialMessage?: string
    ) => {
      if(!employee.value) return;

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

      store.dispatch('records/saveTimesheet', {
        employeeId: employee.value.id,
        week: timesheet.value.week,
        timesheet: timesheet.value,
      });

      let reasonOfDenial = '';
      if (timesheet.value.info) {
        reasonOfDenial = timesheet.value.info.reasonOfDenial;
      }
      if (newTimesheetStatus === recordStatus.DENIED && denialMessage) {
        reasonOfDenial = denialMessage;
      }

      const createNewMessage = (text: string): Message => ({
        id: uuidv4(),
        createdAt: new Date().getTime(),
        text,
      });

      const newMessages = messageInput.value
        ? [...messages.value, createNewMessage(messageInput.value)]
        : [...messages.value];

      const newTimesheet = timesheet.value.info
        ? {
            ...timesheet.value.info,
            status: newTimesheetStatus,
            reasonOfDenial,
            messages: newMessages,
            ...(message.value && {message: message.value}),
          }
        : {
            employeeId: employee.value.id,
            date: new Date(timesheet.value.week[0].date).getTime(),
            status: newTimesheetStatus,
            reasonOfDenial,
            messages: newMessages,
            ...(message.value && {message: message.value}),
          };

      store.dispatch('timesheets/saveTimesheet', newTimesheet);
    };

    const setTotals = (calculatedTotals: TimesheetTotals) => {
      totals.value = calculatedTotals;
    };

    const submitTimesheet = () => {
      let confirmation = true;

      if (totals.value.weekTotal > totals.value.expectedWeekTotal && !showBridgeError) {
        const difference = +(
          totals.value.weekTotal - totals.value.expectedWeekTotal
        ).toFixed(2);
        confirmation = confirm(
          `${
            difference === 1
              ? i18n.t('weekError', {
                  n: difference,
                  expected: totals.value.expectedWeekTotal,
                })
              : i18n.t('weekErrors', {
                  n: difference,
                  expected: totals.value.expectedWeekTotal,
                })
          }`
        );
      } else {
        // Only show this one if total hours is fine, but some days are too long
        const daysExceedingExpected = totals.value.dayTotal.filter(
          (hoursInDay, index) => {
            const weekendHours =
              !timesheet.value?.workScheme[index] && hoursInDay;
            const exceedsExpectedHours =
              timesheet.value?.workScheme[index]?.workHours;
            return hoursInDay > exceedsExpectedHours || weekendHours;
          }
        );

        if (daysExceedingExpected.length && !showBridgeError)
          confirmation = confirm(i18n.t('dayError') as string);
      }

      if (!confirmation) return;

      saveTimesheet(recordStatus.PENDING as TimesheetStatus);
    };

    useMeta(() => ({
      title: pageTitle.value,
    }));

    return {
      startDate,
      recordStatus,
      employee,
      recordsState,
      timesheet,
      showBridgeError,
      projects,
      timesheetStatus,
      isReadonly,
      messages,
      message,
      timesheetDenyMessage,
      showStandby,
      showTravel,
      messageInput,
      hasUnsavedChanges,
      saveTimesheet,
      setTotals,
      submitTimesheet,
    };
  },

  head: {},
});
</script>