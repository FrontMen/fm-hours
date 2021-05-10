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
    { commit, state },
    payload: {
      employeeId: string;
      week: WeekDate[];
      timesheet: WeeklyTimesheet;
      status: TimesheetStatus;
    }
  ) {
    commit("setSaving", { isSaving: true });

    const start = new Date(payload.week[0].date);
    const end = new Date(payload.week[6].date);

    const isNotWithinSavedWeek = (record: TimeRecord | TravelRecord) =>
      !isWithinInterval(new Date(record.date), { start, end });

    const timeRecordsToSave = getTimeRecordsToSave(
      payload.timesheet,
      payload.week,
      payload.status
    );

    const travelRecordsToSave = getTravelRecordsToSave(
      payload.timesheet,
      payload.week,
      payload.status
    );

    const timeRecords = await this.app.$timeRecordsService.saveEmployeeRecords({
      employeeId: payload.employeeId,
      timeRecords: timeRecordsToSave,
    });

    const travelRecords = await this.app.$travelRecordsService.saveEmployeeRecords(
      {
        employeeId: payload.employeeId,
        travelRecords: travelRecordsToSave,
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
  },

  async deleteProjectRecords(
    { commit, state },
    payload: { employeeId: string; week: WeekDate[]; project: TimesheetProject }
  ) {
    commit("setSaving", { isSaving: true });

    const recordsToDelete = payload.project.values.map((value, index) => ({
      id: payload.project.ids[index],
      employeeId: payload.employeeId,
      date: new Date(payload.week[index].date).getTime(),
      hours: value,
      customer: payload.project.customer,
      status: "new" as TimesheetStatus,
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
