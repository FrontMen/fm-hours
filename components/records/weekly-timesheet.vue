<i18n lang="yaml">
en:
  workschemeError: "Could not get workschema data. Holidays, leave, or total hours will not be shown correctly, but you can still fill in and submit your timesheet"
  addComment: "Add a comment here."
  restDayHours: "You have added hours on weekends or holidays, are you sure you want to save this timesheet?"
nl:
  workschemeError: "Kan het werkschema, vakantiedagen en totalen niet ophalen van de server. Je kan nog steeds je uren registreren."
  addComment: "Notitie toevoegen"
  restDayHours: "Je hebt uren geschreven in het weekend of op een vrije dag, weet je zeker dat je de timesheet wil opslaan?"
</i18n>
<template>
  <div v-if="!isLoading">
    <b-alert :show="showBridgeError" dismissible variant="warning" class="mb-3">
      {{ $t('workschemeError') }}
    </b-alert>

    <navigation-buttons
      class="mb-3"
      :start-date="startDate"
      :route-prefix="routePrefix"
    />

    <weekly-timesheet-messages
      v-if="timesheet.info"
      :comments="timesheet.info.messages"
      :readonly="isReadonly"
      @add="addMessage"
    ></weekly-timesheet-messages>

    <weekly-timesheet-container :selected-week="timesheet.week">
      <template #rows>
        <weekly-timesheet-row-hours
          v-for="(project) in projectsOrdered"
          :key="project.customer.id"
          :project="project"
          :readonly="isReadonly"
          :selected-week="timesheet.week"
          :employee="employee"
          @change="hasUnsavedChanges = true"
        />

        <weekly-timesheet-row-leave
          :workscheme="timesheet.workScheme"
        ></weekly-timesheet-row-leave>

        <weekly-timesheet-totals-row
          :projects="timesheet.projects"
          :selected-week="timesheet.week"
          :work-scheme="timesheet.workScheme"
          @totals="setTotals"
        />
      </template>
    </weekly-timesheet-container>

    <weekly-timesheet-container
      v-if="showStandby || showTravel"
      :show-header="false"
      class="mt-4"
    >
      <template #rows>
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
      </template>
    </weekly-timesheet-container>

    <weekly-timesheet-footer
      class="mt-5"
      :has-unsaved-changes="hasUnsavedChanges"
      :is-saving="isSaving"
      :last-saved="lastSaved"
      :status="timesheetStatus"
      :is-admin="isAdmin"
      @save="handleSave"
      @submit="handleSubmit"
      @unsubmit="handleUnsubmit"
      @approve="handleApprove"
      @deny="handleDeny"
      @unapprove="handleUnapprove"
      @reminder="handleReminder"
    />
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, PropType, ref, useContext, useRouter, useStore} from "@nuxtjs/composition-api";
import {startOfISOWeek} from "date-fns";
import {recordStatus} from "~/helpers/record-status";
import {buildWeek, getDateOfISOWeek} from "~/helpers/dates";
import {
  createWeeklyTimesheet,
  getStandByRecordsToSave,
  getTimeRecordsToSave,
  getTravelRecordsToSave
} from "~/helpers/timesheet";
import {Collections} from "~/types/enums";
import {uuidv4} from "~/helpers/helpers";
import {createDenialEmal, createReminderEmail} from "~/helpers/email";

export default defineComponent({
  props: {
    employee: {
      type: Object as PropType<Employee>,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    week: {
      type: Number,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    routePrefix: {
      type: String,
      default: undefined
    }
  },
  setup({employee, year, week}: { employee: Employee, year: number, week: number }) {
    const {i18n, app, localePath} = useContext();
    const store = useStore<RootStoreState>();
    const router = useRouter();

    const isLoading = ref<Boolean>(true);

    const hasUnsavedChanges = ref<Boolean>(false);
    const isSaving = ref<Boolean>(false);
    const lastSaved = ref<Date>();
    const showBridgeError = ref<Boolean>(false);

    const defaultCustomers = computed(() => store.getters['customers/defaultCustomers']);
    const customers = computed(() => store.state.customers.customers);

    // Fetch all customers if we haven't fetched them before
    if (customers.value.length === 0) {
      store.dispatch("customers/getCustomers");
    }

    const projects = computed(() => {
      const employeeCustomers = customers.value.filter((customer) => employee.projects.includes(customer.id));
      return [...employeeCustomers, ...defaultCustomers.value];
    });

    const timesheetStatus = computed(() => {
      return timesheet.value.info ? timesheet.value.info.status : (recordStatus.NEW as TimesheetStatus);
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

    const showStandby = computed(() => employee?.standBy && timesheet.value.standByProject);
    const showTravel = computed(() => employee?.travelAllowance && timesheet.value.travelProject);

    // Show client projects first (alphabetic) and then default projects available for everyone
    const projectsOrdered = computed(() =>
      timesheet?.value?.projects.sort(({customer: customerA}, {customer: customerB}) => {
        // Casting because TS doesn't like to subtract booleans
        const defaultCompare = +customerA.isDefault - +customerB.isDefault;
        return defaultCompare !== 0 ? defaultCompare : customerA.name.localeCompare(customerB.name);
      })
    );

    // TODO: figure out how to get Monday (1) instead of Wednesday (3) without screwing up the timezone
    // const startDate = computed(() => getDateOfISOWeek(parseInt(year.value, 10), parseInt(week.value, 10), 3));
    const startDate = getDateOfISOWeek(year, week, 3);

    const timesheet = ref<WeeklyTimesheet>({
      info: null,
      week: [],
      projects: [],
      leaveDays: null,
      travelProject: null,
      standByProject: null,
      workScheme: []
    });

    const totals = ref<TimesheetTotals>({
      weekTotal: 0,
      expectedWeekTotal: 0,
      dayTotal: [],
    });

    const getTimesheet = async () => {
      if (!employee) return;

      const employeeId = employee.id;

      const workWeek = buildWeek(startOfISOWeek(startDate));

      let workScheme: WorkScheme[] = [];

      const startEpoch = new Date(workWeek[0].date).getTime();

      const sheets = await app.$timesheetsService.getTimesheets({employeeId, date: startEpoch});

      let sheet: Optional<Timesheet, 'id'>;
      sheet = sheets[0];

      if (!sheet) {
        sheet = {
          employeeId: employee.id,
          date: new Date(workWeek[0].date).getTime(),
          status: recordStatus.NEW as TimesheetStatus,
          messages: [],
        }
      }

      // const isOwnTimesheet = store.state.employee.employee?.id === employee.id;
      const isOwnTimesheet = false;
      if (sheet.status === recordStatus.NEW && isOwnTimesheet) {
        try {
          workScheme = await app.$workSchemeService.getWorkScheme({
            bridgeUid: employee.bridgeUid || '',
            startDate: new Date(workWeek[0].date),
            endDate: new Date(workWeek[6].date),
          });
          showBridgeError.value = false;
        } catch ({response}) {
          if (response.status === 401) {
            await logout();
          } else {
            showBridgeError.value = true;
          }
        }
      } else {
        workScheme = sheet.workscheme || [];
      }

      const range = {
        startDate: new Date(workWeek[0].date).getTime().toString(),
        endDate: new Date(workWeek[6].date).getTime().toString()
      }

      const [timeRecords, standByRecords, travelRecords] = await Promise.all([
        app.$timeRecordsService.getEmployeeRecords<TimeRecord>({employeeId, ...range}),
        app.$timeRecordsService.getEmployeeRecords<StandbyRecord>({employeeId, ...range}, 'standby_records'),
        app.$travelRecordsService.getEmployeeRecords({employeeId, ...range}),
      ]);

      // Combine everything in a single timesheet
      timesheet.value = createWeeklyTimesheet({
        sheet,
        week: workWeek,
        projects: projects.value,
        timeRecords,
        travelRecords,
        standByRecords,
        workScheme,
      });

      isLoading.value = false;
    }

    const logout = async () => {
      const authState = await store.dispatch('auth/logout');
      if (authState) router.push(localePath('/login'));
    };

    const saveRecords = async () => {
      if (!employee) return;

      if (!hasUnsavedChanges.value) return;

      if (hasRestDayHours.value) {
        const confirmation = confirm(i18n.t('restDayHours') as string);

        if (!confirmation) return;
      }

      isSaving.value = true;

      const employeeId = employee.id;

      const timeRecordsToSave = getTimeRecordsToSave(timesheet.value);
      const standByRecordsToSave = getStandByRecordsToSave(timesheet.value);
      const travelRecordsToSave = getTravelRecordsToSave(timesheet.value);

      await Promise.all([
        app.$timeRecordsService.saveEmployeeRecords<TimeRecord>({employeeId, timeRecords: timeRecordsToSave}),
        app.$timeRecordsService.saveEmployeeRecords<StandbyRecord>({
            employeeId,
            timeRecords: standByRecordsToSave
          },
          Collections.STANDBYREC
        ),
        app.$travelRecordsService.saveEmployeeRecords({employeeId, travelRecords: travelRecordsToSave})
      ]);

      // TODO: use the responses from the save above instead of getting the entire timesheet again
      await getTimesheet();

      lastSaved.value = new Date();
      isSaving.value = false;
    };

    const saveTimesheet = async () => {
      const sheet = {
        ...timesheet.value.info,
        workscheme: timesheet.value.workScheme
      } as Optional<Timesheet, 'id'>;

      timesheet.value.info = await app.$timesheetsService.saveTimesheet(sheet);
    }

    const changeStatus = async (status: TimesheetStatus,) => {
      if (timesheet.value.info === null) return;

      timesheet.value.info.status = status;

      await saveTimesheet();
    }

    const addMessage = async (message: string) => {
      if (timesheet.value.info === null) return;

      const newMessage = {
        id: uuidv4(),
        createdAt: new Date().getTime(),
        text: message,
      };

      timesheet.value.info.messages = [...timesheet.value.info?.messages, newMessage];

      await saveTimesheet();
    }

    const setTotals = (calculatedTotals: TimesheetTotals) => {
      totals.value = calculatedTotals;
    };

    const handleSave = () => {
      if (timesheetStatus.value === recordStatus.DENIED) {
        changeStatus(recordStatus.NEW as TimesheetStatus);
      }

      saveRecords();
    }

    const handleSubmit = () => {
      let confirmation = true;

      if (totals.value.weekTotal > totals.value.expectedWeekTotal && !showBridgeError.value) {
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
        const daysExceedingExpected = totals.value.dayTotal.filter((hoursInDay, index) => {
          const workSchemeDay = timesheet.value.workScheme?.[index];

          if (!workSchemeDay) return false;

          const weekendHours = !workSchemeDay && hoursInDay;
          const exceedsExpectedHours = workSchemeDay?.workHours;
          return hoursInDay > exceedsExpectedHours || weekendHours;
        });

        if (daysExceedingExpected.length && !showBridgeError.value)
          confirmation = confirm(i18n.t('dayError') as string);
      }

      if (!confirmation) return;

      saveRecords();
      changeStatus(recordStatus.PENDING as TimesheetStatus);
    };

    const handleUnsubmit = () => changeStatus(recordStatus.NEW as TimesheetStatus);

    const handleApprove = () => changeStatus(recordStatus.APPROVED as TimesheetStatus);

    const handleDeny = async () => {
      await app.$mailService.sendMail(createDenialEmal({
        employee,
        week: timesheet.value.week
      }));

      await changeStatus(recordStatus.DENIED as TimesheetStatus);
    };

    const handleUnapprove = () => changeStatus(recordStatus.NEW as TimesheetStatus);

    const handleReminder = async () => {
      const startDate = new Date(timesheet.value?.week[0].date).getTime();

      await app.$mailService.sendMail(createReminderEmail({
        employee,
        startDate,
      }));
    };

    getTimesheet();

    return {
      isLoading,
      startDate,
      timesheet,
      projectsOrdered,
      showBridgeError,
      timesheetStatus,
      isReadonly,
      showStandby,
      showTravel,
      hasUnsavedChanges,
      isSaving,
      lastSaved,
      setTotals,
      handleSave,
      handleSubmit,
      handleUnsubmit,
      handleApprove,
      handleDeny,
      handleUnapprove,
      handleReminder,
      addMessage
    };
  }
});
</script>
