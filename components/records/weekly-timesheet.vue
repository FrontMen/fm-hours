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

    <div class="container">
      <div class="row">
        <navigation-buttons
          class="col-12 col-md-7 mb-3"
          :start-date="startDate"
          :route-prefix="routePrefix"
        />

        <weekly-timesheet-messages
          v-if="timesheet.info"
          :comments="timesheet.info.messages"
          :readonly="isReadonly"
          :show-weekends="showWeekends"
          @add="addMessage"
          @toggle-weekends="toggleWeekends"
        ></weekly-timesheet-messages>
      </div>
    </div>

    <div class="container">
      <weekly-timesheet-container :selected-week="relevantWeeksView" :show-weekends="showWeekends">
        <template #rows>
          <weekly-timesheet-row-hours
            v-for="(timesheetProject) in projectsOrdered"
            :key="timesheetProject.project.customer.id"
            :timesheet-project="timesheetProject"
            :readonly="isReadonly"
            :show-weekends="showWeekends"
            :selected-week="relevantWeeksView"
            :employee="employee"
            :is-admin="isAdmin"
            :is-saving="isSaving"
            @change="hasUnsavedChanges = true"
          />

          <weekly-timesheet-row-leave
            :show-weekends="showWeekends"
            :workscheme="timesheet.workScheme"
            :status="timesheet.info.status"
            @refresh="refreshLeave"
          ></weekly-timesheet-row-leave>

          <weekly-timesheet-totals-row
            :projects="timesheet.projects"
            :show-weekends="showWeekends"
            :selected-week="selectedWeek"
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
            :timesheet-project="timesheet.standByProject"
            :readonly="isReadonly"
            :show-weekends="showWeekends"
            :selected-week="relevantWeeksView"
            :employee="employee"
            @change="hasUnsavedChanges = true"
          />

          <weekly-timesheet-row-kilometer
            v-if="showTravel"
            :timesheet-project="timesheet.travelProject"
            :readonly="isReadonly"
            :show-weekends="showWeekends"
            :selected-week="relevantWeeksView"
            :employee="employee"
            @change="hasUnsavedChanges = true"
          />
        </template>
      </weekly-timesheet-container>

      <weekly-timesheet-footer
        class="mt-3 mt-md-5"
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
        @bridgeAdd="handleBridgeAdd"
        @bridgeRemove="handleBridgeRemove"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  PropType,
  ref,
  useContext,
  useRouter,
  useStore,
} from "@nuxtjs/composition-api";
import {startOfISOWeek} from "date-fns";
import { AxiosError } from "axios";
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

    const showWeekends = ref<boolean>(JSON.parse(localStorage.getItem('showWeekends')!) || false);

    const isLoading = ref<boolean>(true);

    const hasUnsavedChanges = ref<boolean>(false);
    const isSaving = ref<boolean>(false);
    const lastSaved = ref<Date>();
    const showBridgeError = ref<boolean>(false);

    const defaultCustomers = computed(() => store.getters['customers/defaultCustomers']);
    const customers = computed(() => store.state.customers.customers);

    // Fetch all customers if we haven't fetched them before
    if (customers.value.length === 0) {
      store.dispatch("customers/getCustomers");
    }

    const projects = computed(() => {
      const employeeCustomers: Project[] = employee.projects.reduce((list: Project[], project: EmployeeProject) => {
        const foundCustomer = customers.value.find((customer) => customer.id === project.customerId);
        if(!foundCustomer) return list;

        const { contract: customerContract , ...customer } = foundCustomer;
        const contract = project.contract || customerContract || null;

        const newProject = {
          customer,
          contract
        } as Project

        list.push(newProject);
        return list;
      }, []);

      const availableToAll: Project[] = defaultCustomers.value.map((customer: Customer) => {
        const { contract, ...cleanCustomer} = customer
        return {
          customer: cleanCustomer,
          contract: contract || null
        }
      });

      return [...employeeCustomers, ...availableToAll];
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
      return timesheet.value.projects.reduce((_: boolean, project: TimesheetProject) => {
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
      timesheet.value?.projects.sort((projectA: TimesheetProject, projectB: TimesheetProject) => {
        // Casting because TS doesn't like to subtract booleans
        const defaultCompare = +projectA.project.customer.isDefault - +projectB.project.customer.isDefault;
        return defaultCompare !== 0 ? defaultCompare : projectA.project.customer.name.localeCompare(projectB.project.customer.name);
      })
    );

    const selectedWeek = computed(() => {
      return timesheet.value.week;
    });

    const selectedWeekWithoutWeekends = computed(() => {
      return timesheet.value.week.filter(({isWeekend}) => !isWeekend);
    });

    const relevantWeeksView = computed(() => {
      if (showWeekends.value === true) {
        return selectedWeek.value;
      }

      return selectedWeekWithoutWeekends.value;
    });

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
      days: [],
    });

    const getTimesheet = async () => {
      if (!employee) return;

      const employeeId = employee.id;

      const workWeek = buildWeek(startOfISOWeek(startDate));

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

      const workScheme: WorkScheme[] = await getWorkScheme(sheet, workWeek);

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

    const getWorkScheme = async (
      sheet: Optional<Timesheet, 'id'>,
      workWeek: WeekDate[],
      checkOwn: boolean = true
    ): Promise<WorkScheme[]> => {
      let workScheme: WorkScheme[] | undefined = [];
      const isOwnTimesheet = store.state.employee.employee?.id === employee.id;

      if (sheet.status === recordStatus.NEW && (!checkOwn || isOwnTimesheet)) {
        try {
          workScheme = await app.$workSchemeService.getWorkScheme({
            bridgeUid: employee.bridgeUid || '',
            startDate: new Date(workWeek[0].date),
            endDate: new Date(workWeek[6].date),
          });
          showBridgeError.value = false;
        } catch (error) {
          if (error instanceof AxiosError && error.response?.status === 401) {
            await logout();
          } else {
            showBridgeError.value = true;
          }
        }
      } else {
        workScheme = sheet.workscheme;
      }
      return workScheme || [];
    };

    const refreshLeave = async () => {
      if (!timesheet.value?.info || !timesheet.value?.week) return;

      timesheet.value.workScheme = await getWorkScheme(timesheet.value.info, timesheet.value.week, false);
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
        app.$timeRecordsService.saveEmployeeRecords<TimeRecord>({
          employeeId,
          timeRecords: timeRecordsToSave.records,
          contracts: timeRecordsToSave.contracts,
          bridgeUid: employee.bridgeUid
        }),
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

    const addMessage = async ({text, employeeName}: { text: string, employeeName: string }) => {
      if (timesheet.value.info === null) return;

      const newMessage = {
        id: uuidv4(),
        createdAt: new Date().getTime(),
        text,
        employeeName,
      };

      timesheet.value.info.messages = [...timesheet.value.info?.messages, newMessage];

      await saveTimesheet();
    }

    const toggleWeekends = (isShown: boolean) => {
      showWeekends.value = isShown;

      localStorage.setItem('showWeekends', String(isShown));
    };

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
        const hasExceedingDay = totals.value.days.some((day: TimesheetDayTotal) => {
          return day.hours > day.expected;
        });

        if (hasExceedingDay && !showBridgeError.value)
          confirmation = confirm(i18n.t('dayError') as string);
      }

      if (!confirmation) return;

      saveRecords();
      changeStatus(recordStatus.PENDING as TimesheetStatus);
    };

    const handleUnsubmit = () => changeStatus(recordStatus.NEW as TimesheetStatus);

    const handleApprove = () => {
      changeStatus(recordStatus.APPROVED as TimesheetStatus);
      handleBridgeAdd();
    };

    const handleDeny = async () => {
      await changeStatus(recordStatus.DENIED as TimesheetStatus);
    };

    const handleUnapprove = () => {
      changeStatus(recordStatus.NEW as TimesheetStatus);
      handleBridgeRemove();
    };

    const removeWithoutContract = (timeRecordsToSave: { records: TimeRecord[]; contracts: number[] }) => {
      const startingState = {
        contracts: [],
        records: []
      } as { records: TimeRecord[]; contracts: number[] }

      return timeRecordsToSave.records.reduce((acc, item, index) => {
        if (timeRecordsToSave.contracts[index] !== -1) {
          acc.records.push(item);
          acc.contracts.push(timeRecordsToSave.contracts[index]);
        }
        return acc;
      }, startingState);
    }

    const handleBridgeAdd = async () => {
      if (!employee) return;
      if (!employee.bridgeUid) return;

      // Remove existing bridge items
      // These shouldn't exist but you never know...
      await handleBridgeRemove();

      const employeeId = employee.id;
      isSaving.value = true;

      const toSync = removeWithoutContract(getTimeRecordsToSave(timesheet.value));

      await app.$timeRecordsService.addBridgeWorklogs({
        employeeId,
        timeRecords: toSync.records,
        contracts: toSync.contracts,
        bridgeUid: employee.bridgeUid
      });

      // TODO: use the responses from the save above instead of getting the entire timesheet again
      await getTimesheet();

      lastSaved.value = new Date();
      isSaving.value = false;
    }

    const handleBridgeRemove = async () => {
      if (!employee) return;

      isSaving.value = true;

      const timeRecordsToSave = getTimeRecordsToSave(timesheet.value);
      await app.$timeRecordsService.removeBridgeWorklogs(timeRecordsToSave.records);

      // TODO: use the responses from the save above instead of getting the entire timesheet again
      await getTimesheet();

      lastSaved.value = new Date();
      isSaving.value = false;
    }

    getTimesheet();

    return {
      isLoading,
      startDate,
      timesheet,
      projectsOrdered,
      selectedWeek,
      selectedWeekWithoutWeekends,
      relevantWeeksView,
      showBridgeError,
      timesheetStatus,
      isReadonly,
      showStandby,
      showTravel,
      hasUnsavedChanges,
      isSaving,
      lastSaved,
      showWeekends,
      setTotals,
      handleSave,
      handleSubmit,
      handleUnsubmit,
      handleApprove,
      handleDeny,
      handleUnapprove,
      handleBridgeAdd,
      handleBridgeRemove,
      addMessage,
      toggleWeekends,
      refreshLeave
    };
  }
});
</script>
