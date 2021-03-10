import { startOfISOWeek } from "date-fns";
import { MutationTree } from "vuex";

import { buildWeek } from "~/helpers/dates";

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
      startDate: Date;
    }
  ) {
    state.timeRecords = payload.timeRecords;
    state.travelRecords = payload.travelRecords;
    state.selectedWeek = buildWeek(startOfISOWeek(payload.startDate), []);
  },
};

export default mutations;
