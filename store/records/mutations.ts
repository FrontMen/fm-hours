import { MutationTree } from "vuex";

const mutations: MutationTree<RecordsStoreState> = {
  setLoading(state, payload: { isLoading: boolean }) {
    state.isLoading = payload.isLoading;
  },

  setSaving(state, payload: { isSaving: boolean }) {
    state.lastSaved = !payload.isSaving ? new Date() : state.lastSaved
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

  updateRecords(
    state,
    payload: {
      timeRecords: TimeRecord[];
      travelRecords?: TravelRecord[];
    }
  ) {
    state.timeRecords = payload.timeRecords
    state.travelRecords = payload.travelRecords || state.travelRecords
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
};

export default mutations;
