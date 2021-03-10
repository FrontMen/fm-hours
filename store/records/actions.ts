import { ActionTree } from "vuex";

const actions: ActionTree<RecordsStoreState, RootStoreState> = {
  getRecords(
    { commit, rootState },
    payload: { startDate: Date }
  ) {
    commit("setLoading", { isLoading: true })

    const userId = rootState.user.user?.id;
    // eslint-disable-next-line no-console
    console.log("TODO: get records from firestore with parameters", {
      payload,
      userId,
    });

    const result = {
      time_records: [],
      travel_records: [{
        date: '03-10-2021',
        kilometers: 8,
        status: 'NEW'
      }],
    };

    commit("setLoading", { isLoading: false })
    commit("setRecords", {
      timeRecords: result.time_records,
      travelRecords: result.travel_records,
      startDate: payload.startDate,
    });
  },

  saveRecords(
    { commit, rootState },
    payload: { timeRecords: TimeRecord[]; travelRecords: TravelRecord[] }
  ) {
    commit("setSaving", { isSaving: true })

    const userId = rootState.user.user?.id;
    // eslint-disable-next-line no-console
    console.log("TODO: save records from firestore with parameters", {
      payload,
      userId,
    });

    commit("setSaving", { isSaving: false })
    commit("setRecords", {
      timeRecords: payload.timeRecords,
      travelRecords: payload.travelRecords,
    })
  },
};

export default actions;
