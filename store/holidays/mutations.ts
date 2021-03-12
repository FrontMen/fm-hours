import { MutationTree } from "vuex";

const mutations: MutationTree<HolidaysStoreState> = {
  setHolidays(state, payload: { holidays: string[] }) {
    state.holidays = payload.holidays;
  },
};

export default mutations;
