import { MutationTree } from 'vuex';

const mutations: MutationTree<FiltersStoreState> = {
  // Customers
  setCustomerIsArchived(state, payload: boolean) {
    state.customerFilters.archived = payload;
  },
  setCustomerSearchTerm(state, payload: string) {
    state.customerFilters.searchTerm = payload;
  },
  setCustomerSearchCriteria(state, payload: 'name'|'debtor') {
    state.customerFilters.searchCriteria = payload;
  },
  setCustomerSortDescending(state, payload: boolean) {
    state.customerFilters.sortDescending = payload;
  },
  setCustomerSortBy(state, payload: string) {
    state.customerFilters.sortBy = payload;
  },

  // Timesheets
  setTimesheetFilterBy(state, payload: string) {
    state.timesheetFilters.filterBy = payload;
  },
  setTimesheetSortDescending(state, payload: boolean) {
    state.timesheetFilters.sortDescending = payload;
  },
};

export default mutations;
