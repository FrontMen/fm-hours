/* eslint-disable camelcase */
import { ActionTree } from "vuex";

const actions: ActionTree<RecordsStoreState, RootStoreState> = {
  async getRecords({ commit, rootState }, payload: { startDate: Date }) {
    commit("setLoading", { isLoading: true });

    const userId = rootState.user.user?.id;
    const ref = this.$fire.firestore.collection("records").doc(userId);
    const doc = await ref.get();

    if (doc.exists) {
      const data = doc.data();

      commit("setRecords", {
        timeRecords: data?.time_records || [],
        travelRecords: data?.travel_records || [],
        startDate: payload.startDate,
      });
    } else {
      commit("setRecords", {
        timeRecords: [],
        travelRecords: [],
        startDate: payload.startDate
      })
    }

    commit("setLoading", { isLoading: false });
  },

  saveTimesheet(
    { commit, rootState },
    payload: { week: WeekDate[]; timesheet: WeeklyTimesheet }
  ) {
    commit("setSaving", { isSaving: true });

    const timeRecordsToSave: TimeRecord[] = [];
    const travelRecordsToSave: TravelRecord[] = [];

    payload.timesheet.projects.forEach((project) => {
      project.values.forEach((value, index) => {
        if (value === 0) return;

        timeRecordsToSave.push({
          date: payload.week[index].date,
          customer: project.customer,
          hours: value,
          status: "new" as RecordStatus,
        });
      });
    });

    payload.timesheet.travelProject?.values.forEach((value, index) => {
      if (value === 0) return;

      travelRecordsToSave.push({
        date: payload.week[index].date,
        kilometers: value,
        status: "new" as RecordStatus,
      });
    });

    const userId = rootState.user.user?.id;
    const recordsRef = this.$fire.firestore.collection("records").doc(userId);

    if (timeRecordsToSave.length > 0) {
      recordsRef.set({ time_records: timeRecordsToSave }, { merge: true });
    }

    if (travelRecordsToSave.length > 0) {
      recordsRef.set({ travel_records: travelRecordsToSave }, { merge: true });
    }

    commit("setSaving", { isSaving: false });
  },
};

export default actions;
