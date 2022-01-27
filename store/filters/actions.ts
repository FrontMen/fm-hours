import {ActionTree} from 'vuex';

const actions: ActionTree<FiltersStoreState, RootStoreState> = {
  // Customers
  updateCustomerIsArchived({commit}, payload: boolean) {
    commit('setCustomerIsArchived', payload);
  },
  updateCustomerSearchTerm({commit}, payload: string) {
    commit('setCustomerSearchTerm', payload);
  },
  updateCustomerSearchCriteria({commit}, payload: 'name' | 'debtor') {
    commit('setCustomerSearchCriteria', payload);
  },
  updateCustomerSortDescending({commit}, payload: boolean) {
    commit('setCustomerSortDescending', payload);
  },
  updateCustomerSortBy({commit}, payload: string) {
    commit('setCustomerSortBy', payload);
  },

  // Timesheets
  updateTimesheetSortDescending({commit}, payload: boolean) {
    commit('setTimesheetSortDescending', payload);
  },
  updateTimesheetFilterBy({commit}, payload: string) {
    commit('setTimesheetFilterBy', payload);
  },
};

export default actions;
