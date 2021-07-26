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

  // Timesheets
  updateEmployeeFilterBy({commit}, payload: string) {
    commit('setEmployeeFilterBy', payload);
  },
  updateEmployeeFilterByCustomer({commit}, payload: string[]) {
    commit('setEmployeeFilterByCustomer', payload);
  },
  updateEmployeeSearchTerm({commit}, payload: string) {
    commit('setEmployeeSearchTerm', payload);
  },
};

export default actions;
