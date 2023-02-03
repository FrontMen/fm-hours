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
          :readonly="$store.getters['timesheets/isReadonly']"
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
            v-for="(timesheetProject) in $store.getters['timesheets/projectsOrdered']"
            :key="timesheetProject.project.customer.id"
            :timesheet-project="timesheetProject"
            :readonly="$store.getters['timesheets/isReadonly']"
            :show-weekends="showWeekends"
            :selected-week="relevantWeeksView"
            :employee="employee"
            :is-admin="isAdmin"
            :is-saving="isSaving"
            @change="hasUnsavedChanges = true"
          />

          <weekly-timesheet-row-leave
            v-if="showLeave"
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
            :readonly="$store.getters['timesheets/isReadonly']"
            :show-weekends="showWeekends"
            :selected-week="relevantWeeksView"
            :employee="employee"
            @change="hasUnsavedChanges = true"
          />

          <weekly-timesheet-row-kilometer
            v-if="showTravel"
            :timesheet-project="timesheet.travelProject"
            :readonly="$store.getters['timesheets/isReadonly']"
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
        :status="$store.getters['timesheets/timesheetStatus']"
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
  useStore,
} from "@nuxtjs/composition-api";
import {recordStatus} from "~/helpers/record-status";
import {getDateOfISOWeek} from "~/helpers/dates";
import {
  getStandByRecordsToSave,
  getTimeRecordsToSave,
  getTravelRecordsToSave
} from "~/helpers/timesheet";
import {Collections} from "~/types/enums";

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
    const {i18n, app} = useContext();
    const store = useStore<RootStoreState>();

    const showWeekends = ref<boolean>(JSON.parse(localStorage.getItem('showWeekends')!) || false);

    const isLoading = ref<boolean>(true);

    const hasUnsavedChanges = ref<boolean>(false);
    const isSaving = ref<boolean>(false);
    const lastSaved = ref<Date>();

    const customers = computed(() => store.state.customers.customers);
    const timesheet = computed(() => store.state.timesheets.weeklyTimesheet);
    const showBridgeError = computed(() => store.state.timesheets.isErrored.bridge);

    // Fetch all customers if we haven't fetched them before
    if (customers.value.length === 0) {
      store.dispatch("customers/getCustomers");
    }

    const showLeave = computed(() => !employee?.freelancer);
    const showStandby = computed(() => employee?.standBy && timesheet.value.standByProject);
    const showTravel = computed(() => employee?.travelAllowance && timesheet.value.travelProject);

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

    const totals = ref<TimesheetTotals>({
      weekTotal: 0,
      expectedWeekTotal: 0,
      days: [],
    });

    const getTimesheet = async ({checkOwnWorkScheme = true} : {checkOwnWorkScheme?: boolean} = {}) => {
      await store.dispatch('timesheets/getWeeklyTimesheet', { employee, startDate, checkOwnWorkScheme });

      isLoading.value = false;
    }

    const refreshLeave = async () => {
      if (!timesheet.value?.info || !timesheet.value?.week) return;

      await getTimesheet({checkOwnWorkScheme : false});
    }

    const saveRecords = async () => {
      if (!employee) return;

      if (!hasUnsavedChanges.value) return;
      if (store.getters['timesheets/hasRestDayHours']) {
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
      await store.dispatch('timesheets/save');
    }

    const changeStatus = async (status: TimesheetStatus,) => {
      if (timesheet.value.info === null) return;

      store.commit('timesheets/setTimesheetStatus', { status });

      await saveTimesheet();
    }

    const addMessage = async ({text, employeeName}: { text: string, employeeName: string }) => {
      if (timesheet.value.info === null) return;

      await store.dispatch('timesheets/addMessage', {text, employeeName});
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
      if (store.getters['timesheets/timesheetStatus'] === recordStatus.DENIED) {
        changeStatus(recordStatus.NEW as TimesheetStatus);
      }

      saveRecords();
    }

    const handleSubmit = () => {
      let confirmation = true;

      const hasZeroHours = totals.value.expectedWeekTotal === 0;
      const toManyHours = totals.value.weekTotal > totals.value.expectedWeekTotal;

      if (!hasZeroHours && toManyHours && !showBridgeError.value) {
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
      selectedWeek,
      selectedWeekWithoutWeekends,
      relevantWeeksView,
      showBridgeError,
      showLeave,
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
