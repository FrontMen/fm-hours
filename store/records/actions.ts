/* eslint-disable camelcase */
import { addDays, startOfISOWeek, subDays } from "date-fns";
import { ActionTree } from "vuex";

import { buildWeek } from "~/helpers/dates";

const actions: ActionTree<RecordsStoreState, RootStoreState> = {
  async getRecords({ commit, rootState }, payload: { startDate: Date }) {
    commit("setLoading", { isLoading: true });

    const selectedWeek = buildWeek(startOfISOWeek(payload.startDate), [])
    const workSchemeResult = await this.app.$workSchemeService.getWorkScheme({
      userId: rootState.user.user?.id,
      startDate: new Date(selectedWeek[0].date),
      endDate: new Date(selectedWeek[6].date),
    })

    const recordsResult = await this.app.$recordsService.getUserRecords({
      userId: rootState.user.user?.id,
    });

    commit("setLoading", { isLoading: false });
    commit("setRecords", {
      timeRecords: recordsResult.timeRecords,
      travelRecords: recordsResult.travelRecords,
      selectedWeek,
      workScheme: workSchemeResult,
    });
  },

  async goToWeek({ commit, state, rootState }, payload: { to: 'current' | 'next' | 'previous' }) {
    const currentStartDate = state.selectedWeek[0].date;
    let newStartDate = new Date()

    if (payload.to === 'previous') {
      newStartDate = subDays(new Date(currentStartDate), 7);
    } else if (payload.to === 'next') {
      newStartDate = addDays(new Date(currentStartDate), 7);
    }

    const selectedWeek = buildWeek(startOfISOWeek(newStartDate), []);
    const workSchemeResult = await this.app.$workSchemeService.getWorkScheme({
      userId: rootState.user.user?.id,
      startDate: new Date(selectedWeek[0].date),
      endDate: new Date(selectedWeek[6].date),
    })

    commit('setSelectedWeek', {
      selectedWeek,
      workScheme: workSchemeResult,
    })
  },

  async saveTimesheet(
    { commit, rootState },
    payload: { week: WeekDate[]; timesheet: WeeklyTimesheet }
  ) {
    commit("setSaving", { isSaving: true });

    const timeRecordsToSave: TimeRecord[] = [];
    const travelRecordsToSave: TravelRecord[] = [];

    payload.timesheet.projects.forEach((project) => {
      if (project.isExternal) return

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

    // TODO: should commit merged records to state

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
