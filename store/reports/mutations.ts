import {MutationTree} from 'vuex';

const mutations: MutationTree<ReportsStoreState> = {
  setIsLoading(state, payload: {isLoading: boolean}) {
    state.isLoading = payload.isLoading;
  },

  setStartDate(state, payload: Date) {
    state.startDate = payload;
  },

  saveMonthlyReportData(state, payload: MonthlyReportData) {
    state.reportData = {
      nonBillableProjects: payload.nonBillableProjects,
      employees: payload.employees,
    };
  },
};

export default mutations;
