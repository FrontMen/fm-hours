/* eslint-disable camelcase */
import { addDays, startOfISOWeek, subDays, isWithinInterval } from "date-fns";
import { ActionTree } from "vuex";

import { buildWeek } from "~/helpers/dates";
import {
  getTimeRecordsToSave,
  getTravelRecordsToSave,
} from "~/helpers/timesheet";

const actions: ActionTree<RecordsStoreState, RootStoreState> = {
  async getRecords(
    { commit },
    payload: { employeeId: string; startDate: Date }
  ) {
    commit("setLoading", { isLoading: true });

    const selectedWeek = buildWeek(startOfISOWeek(payload.startDate), []);
    const workSchemeResult = await this.app.$workSchemeService.getWorkScheme({
      employeeId: payload.employeeId,
      startDate: new Date(selectedWeek[0].date),
      endDate: new Date(selectedWeek[6].date),
    });

    const timeRecords = await this.app.$timeRecordsService.getEmployeeRecords({
      employeeId: payload.employeeId,
    });

    const travelRecords = await this.app.$travelRecordsService.getEmployeeRecords(
      {
        employeeId: payload.employeeId,
      }
    );

    commit("setLoading", { isLoading: false });
    commit("setRecords", {
      timeRecords,
      travelRecords,
      selectedWeek,
      workScheme: workSchemeResult,
    });
  },

  async goToWeek(
    { commit, state },
    payload: { employeeId: string; to: "current" | "next" | "previous" }
  ) {
    const currentStartDate = state.selectedWeek[0].date;
    let newStartDate = new Date();

    if (payload.to === "previous") {
      newStartDate = subDays(new Date(currentStartDate), 7);
    } else if (payload.to === "next") {
      newStartDate = addDays(new Date(currentStartDate), 7);
    }

    const selectedWeek = buildWeek(startOfISOWeek(newStartDate), []);
    const workSchemeResult = await this.app.$workSchemeService.getWorkScheme({
      employeeId: payload.employeeId,
      startDate: new Date(selectedWeek[0].date),
      endDate: new Date(selectedWeek[6].date),
    });

    commit("setSelectedWeek", {
      selectedWeek,
      workScheme: workSchemeResult,
    });
  },

  async saveTimesheet(
    { commit, state, rootState },
    payload: {
      employeeId: string;
      week: WeekDate[];
      timesheet: WeeklyTimesheet;
      status: RecordStatus;
    }
  ) {
    commit("setSaving", { isSaving: true });

    console.log(">>>> week", payload.week);
    console.log(">>>> timesheet", payload.timesheet);
    console.log(">>>> status", payload.status);

    const start = new Date(payload.week[0].date);
    const end = new Date(payload.week[6].date);

    const isNotWithinSavedWeek = (record: TimeRecord | TravelRecord) =>
      !isWithinInterval(new Date(record.date), { start, end });

    const currentWeeklyTimesheet = rootState.timesheets.weeklyTimesheetsStatus.find(
      (weeklyTimesheet) =>
        weeklyTimesheet.employeeId === payload.employeeId &&
        weeklyTimesheet.startDate === start.getTime()
    );

    const employeeWeeklyTimesheet: WeeklyTimesheetStatus =
      currentWeeklyTimesheet ||
      (await this.app.$weeklyTimesheetStatusService.createWeeklyTimesheet({
        employeeId: payload.employeeId,
        startDate: start.getTime(),
        endDate: end.getTime(),
        timeRecordIds: [],
        travelRecordIds: [],
        status: payload.status,
      }));

    const timeRecordsToSave = getTimeRecordsToSave(
      payload.timesheet,
      payload.week,
      payload.status,
      employeeWeeklyTimesheet.id
    );

    const travelRecordsToSave = getTravelRecordsToSave(
      payload.timesheet,
      payload.week,
      payload.status,
      employeeWeeklyTimesheet.id
    );

    const timeRecordsPromise = this.app.$timeRecordsService.saveEmployeeRecords(
      {
        employeeId: payload.employeeId,
        timeRecords: timeRecordsToSave,
      }
    );

    const travelRecordsPromise = this.app.$travelRecordsService.saveEmployeeRecords(
      {
        employeeId: payload.employeeId,
        travelRecords: travelRecordsToSave,
      }
    );

    const [timeRecords, travelRecords] = await Promise.all([
      timeRecordsPromise,
      travelRecordsPromise,
    ]);

    const updatedTimeRecordIds = timeRecords.reduce((acc, timeRecord) => {
      if (!timeRecord.id) return acc;
      return !timeRecord.hours ? [...acc, timeRecord.id] : acc;
    }, [] as string[]);

    const updatedTravelRecordIds = timeRecords.reduce((acc, travelRecord) => {
      if (!travelRecord.id) return acc;
      return !travelRecord.hours ? [...acc, travelRecord.id] : acc;
    }, [] as string[]);

    const updatedWeeklyTimesheetStatus = await this.app.$weeklyTimesheetStatusService.updateWeeklyTimesheetStatus(
      {
        weeklyTimesheet: employeeWeeklyTimesheet,
        status: payload.status,
        timeRecordIds: updatedTimeRecordIds,
        travelRecordIds: updatedTravelRecordIds,
      }
    );

    const updatedWeeklyTimesheetStatusList = rootState.timesheets.weeklyTimesheetsStatus.map(
      (weeklyTimesheet) => {
        if (
          weeklyTimesheet.employeeId === payload.employeeId &&
          weeklyTimesheet.startDate === start.getTime()
        ) {
          return updatedWeeklyTimesheetStatus;
        }

        return weeklyTimesheet;
      }
    );

    commit("setSaving", { isSaving: false });
    commit("updateRecords", {
      timeRecords: [
        ...state.timeRecords.filter(isNotWithinSavedWeek),
        ...timeRecords,
      ],
      travelRecords: [
        ...state.travelRecords.filter(isNotWithinSavedWeek),
        ...travelRecords,
      ],
    });
    commit(
      "timesheets/setWeeklyTimesheetsStatus",
      { weeklyTimesheetStatus: updatedWeeklyTimesheetStatusList },
      { root: true }
    );
  },

  async deleteProjectRecords(
    { commit, state, rootState },
    payload: { employeeId: string; week: WeekDate[]; project: TimesheetProject }
  ) {
    commit("setSaving", { isSaving: true });

    const currentWeeklyTimesheet = rootState.timesheets.weeklyTimesheetsStatus.find(
      (weeklyTimesheet) =>
        weeklyTimesheet.employeeId === payload.employeeId &&
        weeklyTimesheet.startDate === new Date(payload.week[0].date).getTime()
    );

    if (!currentWeeklyTimesheet) return;

    const recordsToDelete = payload.project.values.map((value, index) => ({
      id: payload.project.ids[index],
      employeeId: payload.employeeId,
      date: new Date(payload.week[index].date).getTime(),
      hours: value,
      customer: payload.project.customer,
      status: "new" as RecordStatus,
      weeklyTimesheetStatusId: currentWeeklyTimesheet.id,
    }));

    await this.app.$timeRecordsService.deleteEmployeeRecords({
      recordsToDelete,
    });

    commit("updateRecords", {
      timeRecords: state.timeRecords.filter(
        (x) => !recordsToDelete.some((y) => y.id === x.id)
      ),
    });

    commit("setSaving", { isSaving: false });
  },
};

export default actions;
