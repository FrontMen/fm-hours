import { MutationTree } from "vuex";
import { subDays, startOfISOWeek } from "date-fns";

import { addDays } from "~/helpers/dates";

const mutations: MutationTree<WeekDatesStoreState> = {
  setToday(state) {
    state.currentDate = new Date();
  },

  nextWeek(state) {
    const startDate = startOfISOWeek(new Date(state.currentDate));
    state.currentDate = addDays(startDate, 7);
  },

  prevWeek(state) {
    const startDate = startOfISOWeek(new Date(state.currentDate));
    state.currentDate = subDays(new Date(startDate), 7);
  },
};

export default mutations;
