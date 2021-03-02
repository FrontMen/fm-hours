import { MutationTree } from "vuex";

const mutations: MutationTree<HolidaysStoreState> = {
  setHolidays(state, payload: { holidays: string[] }) {
    state.holidays = payload.holidays;
  },

  setHolidayDocId(state, payload: { docId: string }) {
    state.docId = payload.docId;
  },
};

export default mutations;
