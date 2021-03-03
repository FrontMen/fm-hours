import { ActionTree } from "vuex";

const actions: ActionTree<WeekDatesStoreState, RootStoreState> = {
  setToday({ commit }) {
    commit("setToday");
  },

  nextWeek({ commit }) {
    commit("nextWeek");
  },

  prevWeek({ commit }) {
    commit("prevWeek");
  },
};

export default actions;
