/* eslint-disable camelcase */
import {addDays, startOfISOWeek, subDays, isWithinInterval} from 'date-fns';
import {ActionTree} from 'vuex';

import {buildWeek, checkNonWorkingDays, getDayOnGMT} from '~/helpers/dates';
import {
  getTimeRecordsToSave,
  getTravelRecordsToSave,
  getStandByRecordsToSave,
} from '~/helpers/timesheet';
import {Collections} from '~/types/enums';

const actions: ActionTree<RecordsStoreState, RootStoreState> = {
  async getMonthlyTimeRecords(
    {commit},
    payload: {employeeId: string; startDate: Date; endDate: Date}
  ) {
    if (
      !payload.employeeId ||
      !payload.startDate?.getTime() ||
      !payload.endDate?.getTime()
    )
      return;

    commit('setLoading', {isLoading: true});

    const timeRecords =
      await this.app.$timeRecordsService.getEmployeeRecords<TimeRecord>({
        employeeId: payload.employeeId,
        startDate: payload.startDate.getTime().toString(),
        endDate: payload.endDate.getTime().toString(),
      });

    commit('setLoading', {isLoading: false});
    commit('setRecords', {
      timeRecords,
    });
  },

  async getRecords(
    {commit},
    payload: {employeeId: string; startDate: Date; bridgeUid?: string}
  ) {
    commit('setLoading', {isLoading: true});

    const workWeek = buildWeek(startOfISOWeek(payload.startDate));
    let workSchemeResult: WorkScheme[] | undefined;

    if (payload.bridgeUid) {
      try {
        workSchemeResult = await this.app.$workSchemeService.getWorkScheme({
          bridgeUid: payload.bridgeUid,
          startDate: new Date(workWeek[0].date),
          endDate: new Date(workWeek[6].date),
        });
      } catch (error) {
        commit(
          'setErrorMessageWorkscheme',
          error.response
            ? 'An unexpected error happened while trying to retrieve WorkScheme'
            : error.message
        );
      }
    }

    const selectedWeek = checkNonWorkingDays(workWeek, workSchemeResult);

    const timeRecords =
      await this.app.$timeRecordsService.getEmployeeRecords<TimeRecord>({
        employeeId: payload.employeeId,
      });

    const leaveDays: WeekDate[] = selectedWeek.filter(
      (day: WeekDate) => day.isLeaveDay
    );

    const standByRecords =
      await this.app.$timeRecordsService.getEmployeeRecords<StandbyRecord>(
        {
          employeeId: payload.employeeId,
        },
        'standby_records'
      );

    const travelRecords =
      await this.app.$travelRecordsService.getEmployeeRecords({
        employeeId: payload.employeeId,
      });

    commit('setLoading', {isLoading: false});
    commit('setRecords', {
      timeRecords,
      travelRecords,
      leaveDays,
      selectedWeek,
      workScheme: workSchemeResult || [],
      standByRecords,
    });
  },

  async goToWeek(
    {commit, state},
    payload: {to: 'current' | 'next' | 'previous'; bridgeUid?: string}
  ) {
    const currentStartDate = state.selectedWeek[0].date;
    let newStartDate = new Date();

    if (payload.to === 'previous') {
      newStartDate = subDays(getDayOnGMT(currentStartDate), 7);
    } else if (payload.to === 'next') {
      newStartDate = addDays(getDayOnGMT(currentStartDate), 7);
    }

    const workWeek = buildWeek(startOfISOWeek(newStartDate));

    let workSchemeResult: WorkScheme[] | undefined;
    if (payload.bridgeUid) {
      workSchemeResult = await this.app.$workSchemeService.getWorkScheme({
        bridgeUid: payload.bridgeUid,
        startDate: new Date(workWeek[0].date),
        endDate: new Date(workWeek[6].date),
      });
    }

    const selectedWeek = checkNonWorkingDays(workWeek, workSchemeResult);

    commit('setSelectedWeek', {
      selectedWeek,
      workScheme: workSchemeResult || [],
    });
  },

  async saveTimesheet(
    {commit, state},
    payload: {
      employeeId: string;
      week: WeekDate[];
      timesheet: WeeklyTimesheet;
    }
  ) {
    commit('setSaving', {isSaving: true});

    const start = new Date(payload.week[0].date);
    const end = new Date(payload.week[6].date);

    const isNotWithinSavedWeek = (
      record: TimeRecord | TravelRecord | StandbyRecord
    ) => !isWithinInterval(new Date(record.date), {start, end});

    const timeRecordsToSave = getTimeRecordsToSave(
      payload.timesheet,
      payload.week
    );

    const travelRecordsToSave = getTravelRecordsToSave(
      payload.timesheet,
      payload.week
    );

    const standByRecordsToSave = getStandByRecordsToSave(
      payload.timesheet,
      payload.week
    );

    const timeRecords =
      await this.app.$timeRecordsService.saveEmployeeRecords<TimeRecord>({
        employeeId: payload.employeeId,
        timeRecords: timeRecordsToSave,
      });

    const standByRecords =
      await this.app.$timeRecordsService.saveEmployeeRecords<StandbyRecord>(
        {
          employeeId: payload.employeeId,
          timeRecords: standByRecordsToSave,
        },
        Collections.STANDBYREC
      );

    const travelRecords =
      await this.app.$travelRecordsService.saveEmployeeRecords({
        employeeId: payload.employeeId,
        travelRecords: travelRecordsToSave,
      });

    commit('setSaving', {isSaving: false});
    commit('updateRecords', {
      timeRecords: [
        ...state.timeRecords.filter(isNotWithinSavedWeek),
        ...timeRecords,
      ],
      travelRecords: [
        ...state.travelRecords.filter(isNotWithinSavedWeek),
        ...travelRecords,
      ],
      standByRecords: [
        ...state.standByRecords.filter(isNotWithinSavedWeek),
        ...standByRecords,
      ],
    });
  },

  async deleteProjectRecords(
    {commit, state},
    payload: {
      employeeId: string;
      week: WeekDate[];
      project: TimesheetProject;
    }
  ) {
    commit('setSaving', {isSaving: true});

    const recordsToDelete = payload.project.values.map((value, index) => ({
      id: payload.project.ids[index],
      employeeId: payload.employeeId,
      date: new Date(payload.week[index].date).getTime(),
      hours: value,
      customer: payload.project.customer,
    }));

    await this.app.$timeRecordsService.deleteEmployeeRecords<TimeRecord>({
      recordsToDelete,
    });

    commit('updateRecords', {
      timeRecords: state.timeRecords.filter(
        (x) => !recordsToDelete.some((y) => y.id === x.id)
      ),
    });

    commit('setSaving', {isSaving: false});
  },
};

export default actions;
