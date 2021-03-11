import { MutationTree } from "vuex";

const mutations: MutationTree<RecordsStoreState> = {
  setLoading(state, payload: { isLoading: boolean }) {
    state.isLoading = payload.isLoading;
  },

  setSaving(state, payload: { isSaving: boolean }) {
    state.isSaving = payload.isSaving;
  },

  setRecords(
    state,
    payload: {
      timeRecords: TimeRecord[];
      travelRecords: TravelRecord[];
      selectedWeek: WeekDate[];
      workScheme: WorkScheme[]
    }
  ) {
    state.timeRecords = payload.timeRecords;
    state.travelRecords = payload.travelRecords;
    state.selectedWeek = payload.selectedWeek;
    state.workScheme = payload.workScheme;
  },

  setSelectedWeek(
    state,
    payload: {
      selectedWeek: WeekDate[];
      workScheme: WorkScheme[];
    }
  ) {
    state.selectedWeek = payload.selectedWeek;
    state.workScheme = payload.workScheme;
  },

  setTimeRecords(state, payload: { timeRecords: TimeRecord[] }) {
    state.timeRecords = payload.timeRecords;
  },
};

export default mutations;
