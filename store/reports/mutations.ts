import {MutationTree} from 'vuex';

const mutations: MutationTree<ReportsStoreState> = {
  setIsLoading(state, payload: {isLoading: boolean}) {
    state.isLoading = payload.isLoading;
  },

  setStartDate(state, payload: Date) {
    state.startDate = payload;
  },

  saveMonthlyReportData(state, payload: MonthlyReportData) {
    state.reportData = payload;
  },
};

export default mutations;
