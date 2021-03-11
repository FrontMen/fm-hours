/* eslint-disable camelcase */
import { ActionTree } from "vuex";

const actions: ActionTree<RecordsStoreState, RootStoreState> = {
  async getRecords({ commit, rootState }, payload: { startDate: Date }) {
    commit("setLoading", { isLoading: true });

    const result = await this.app.$recordsService.getUserRecords({
      userId: rootState.user.user?.id,
    });

    commit("setLoading", { isLoading: false });
    commit("setRecords", {
      timeRecords: result.timeRecords,
      travelRecords: result.travelRecords,
      startDate: payload.startDate,
    });
  },

  async saveTimesheet(
    { commit, rootState },
    payload: { week: WeekDate[]; timesheet: WeeklyTimesheet }
  ) {
    commit("setSaving", { isSaving: true });

    const timeRecordsToSave: TimeRecord[] = [];
    const travelRecordsToSave: TravelRecord[] = [];

    payload.timesheet.projects.forEach((project) => {
      project.values.forEach((value, index) => {
        timeRecordsToSave.push({
          date: payload.week[index].date,
          customer: project.customer,
          hours: value,
          status: "new" as RecordStatus,
        });
      });
    });

    payload.timesheet.travelProject?.values.forEach((value, index) => {
      travelRecordsToSave.push({
        date: payload.week[index].date,
        kilometers: value,
        status: "new" as RecordStatus,
      });
    });

    await this.app.$recordsService.saveUserRecords({
      userId: rootState.user.user?.id,
      timeRecords: timeRecordsToSave,
      travelRecords: travelRecordsToSave,
    });

    commit("setSaving", { isSaving: false });
  },

  async deleteProjectRecords(
    { commit, rootState },
    payload: { week: WeekDate[]; project: TimesheetProject }
  ) {
    commit("setSaving", { isSaving: true });

    const recordsToDelete = payload.project.values.map((value, index) => ({
      date: payload.week[index].date,
      hours: value,
      customer: payload.project.customer,
      status: "new" as RecordStatus,
    }));

    commit("setTimeRecords", {
      timeRecords: await this.app.$recordsService.deleteUserRecords({
        userId: rootState.user.user?.id,
        recordsToDelete,
      }),
    });

    commit("setSaving", { isSaving: false });
  },
};

export default actions;
