import {computed, useStore, ref, watch} from '@nuxtjs/composition-api';
import {startOfISOWeek, subDays} from 'date-fns';

import {buildWeek, getDayOnGMT} from '~/helpers/dates';
import {recordStatus} from '~/helpers/record-status';
import {
  createWeeklyTimesheet,
  timesheetFormatter,
  kilometerFormatter,
  createLeaveProject,
} from '~/helpers/timesheet';
import {buildEmailData} from '~/helpers/email';
import {debounce, uuidv4} from '~/helpers/helpers';

export default (
  employeeId: string,
  startTimestamp?: number,
  bridgeUid?: string
) => {
  const store = useStore<RootStoreState>();
  const hasUnsavedChanges = ref<Boolean>(false);
  const unsavedWeeklyTimesheet = ref<WeeklyTimesheet>();
  const recordsState = computed(() => store.state.records);
  const timesheetState = computed(() => store.state.timesheets);
  const customers = computed(() => store.state.customers);
  const message = computed(() => timesheetState.value?.timesheets[0]?.message);
  const messageInput = ref('');

  const timesheetStatus = computed(() => {
    return timesheetState.value.timesheets[0]
      ? timesheetState.value.timesheets[0].status
      : (recordStatus.NEW as TimesheetStatus);
  });

  const timesheetDenyMessage = computed(() =>
    timesheetState.value.timesheets[0]
      ? timesheetState.value.timesheets[0].reasonOfDenial
      : ''
  );

  const isReadonly = computed(
    () =>
      timesheetStatus.value === recordStatus.APPROVED ||
      timesheetStatus.value === recordStatus.PENDING
  );

  const timesheet = ref<WeeklyTimesheet>({
    projects: [],
    leaveDays: null,
    travelProject: null,
    standByProject: null,
  });

  const initialDate = startTimestamp ? new Date(startTimestamp) : new Date();

  store.dispatch('records/getRecords', {
    employeeId,
    startDate: initialDate,
    bridgeUid,
  });

  const messages = ref<Message[]>(
    timesheetState.value?.timesheets[0]?.messages || []
  );
  watch(
    () => timesheetState.value?.timesheets[0],
    () => {
      messages.value = timesheetState.value?.timesheets[0]?.messages || [];
    },
    {immediate: true}
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

  const goToWeek = (to: 'current' | 'previous' | 'next') => {
    cancelAutoSave();
    if (hasUnsavedChanges.value) {
      const confirmation = confirm(
        'You have unsaved changes, are you sure you want to switch to another week?'
      );

      if (!confirmation) {
        debouncedAutoSave();
        return;
      }
    }

    unsavedWeeklyTimesheet.value = undefined;
    hasUnsavedChanges.value = false;
    messageInput.value = '';
    store.dispatch('records/goToWeek', {bridgeUid, to});
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
            (c) => c.id === project.customer.id
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

    hasUnsavedChanges.value = true;
  };

  watch(
    () => [
      recordsState.value.selectedWeek,
      recordsState.value.timeRecords,
      recordsState.value.travelRecords,
      recordsState.value.standByRecords,
    ],
    () => {
      if (!timesheet.value) {
        hasUnsavedChanges.value = false;
      }

      store.dispatch('timesheets/getTimesheets', {
        date: new Date(recordsState.value.selectedWeek[0].date).getTime(),
        employeeId,
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

      unsavedWeeklyTimesheet.value = undefined;
    },
    {deep: true}
  );

  const saveTimesheet = (
    newTimesheetStatus: TimesheetStatus,
    denialMessage?: string
  ) => {
    if (!hasUnsavedChanges.value) return;

    if (newTimesheetStatus === recordStatus.NEW && hasRestDayHours.value) {
      const confirmation = confirm(
        'You have add hours on weekends or holidays, are you sure you want to save this timesheet?'
      );

      if (!confirmation) return;
    }

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

    if (!selectedTimesheet || selectedTimesheet.status !== recordStatus.PENDING)
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

  const autoSave = () => {
    saveTimesheet(recordStatus.NEW as TimesheetStatus);
  };

  const debouncedAutoSave = debounce((cancel?: boolean) => {
    if (cancel) return;

    autoSave();
  }, 5000);

  const cancelAutoSave = () => debouncedAutoSave(true);

  return {
    goToWeek,
    copyPreviousWeek,
    addProject,
    deleteProject,
    hasUnsavedChanges,
    timesheet,
    timesheetFormatter: timesheetFormatter(24),
    kilometerFormatter: kilometerFormatter(0, 9999),
    saveTimesheet,
    timesheetStatus,
    isReadonly,
    timesheetDenyMessage,
    message,
    messages,
    messageInput,
    denyTimesheet,
    autoSave: debouncedAutoSave,
  };
};
