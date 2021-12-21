/* eslint-disable camelcase */
import {addDays, startOfISOWeek, subDays, isWithinInterval} from 'date-fns';
import type {ActionTree} from 'vuex';

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

    const selectedWeek = checkNonWorkingDays(workWeek, workSchemeResult);

    const leaveDays: WeekDate[] = selectedWeek.filter(
      (day: WeekDate) => day.isLeaveDay
    );

    const timeRecords =
      await this.app.$timeRecordsService.getEmployeeRecords<TimeRecord>({
        employeeId: payload.employeeId,
      });

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

  goToWeek(
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

    const timeRecordsToSave = getTimeRecordsToSave(payload.timesheet);
    const travelRecordsToSave = getTravelRecordsToSave(payload.timesheet);
    const standByRecordsToSave = getStandByRecordsToSave(payload.timesheet);

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
};

export default actions;
