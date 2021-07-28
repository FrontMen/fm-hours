import {MutationTree} from 'vuex';

const mutations: MutationTree<RecordsStoreState> = {
  setLoading(state, payload: {isLoading: boolean}) {
    state.isLoading = payload.isLoading;
  },

  setSaving(state, payload: {isSaving: boolean}) {
    state.lastSaved = !payload.isSaving ? new Date() : state.lastSaved;
    state.isSaving = payload.isSaving;
  },

  setRecords(
    state,
    payload: {
      timeRecords: TimeRecord[];
      travelRecords: TravelRecord[];
      leaveDays: WeekDate[];
      selectedWeek: WeekDate[];
      standByRecords: StandbyRecord[];
      workScheme: WorkScheme[];
    }
  ) {
    if (payload.timeRecords) state.timeRecords = payload.timeRecords;
    if (payload.travelRecords) state.travelRecords = payload.travelRecords;
    if (payload.selectedWeek) state.selectedWeek = payload.selectedWeek;
    if (payload.workScheme) state.workScheme = payload.workScheme;
    if (payload.leaveDays) state.leaveDays = payload.leaveDays;
    if (payload.standByRecords) state.standByRecords = payload.standByRecords;
  },

  updateRecords(
    state,
    payload: {
      timeRecords: TimeRecord[];
      travelRecords?: TravelRecord[];
      standByRecords?: StandbyRecord[];
    }
  ) {
    state.timeRecords = payload.timeRecords;
    state.travelRecords = payload.travelRecords || state.travelRecords;
    state.standByRecords = payload.standByRecords || state.standByRecords;
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
