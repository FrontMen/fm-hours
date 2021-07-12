import { GetterTree } from "vuex";

const getters: GetterTree<FiltersStoreState, RootStoreState> = {
  getIsCustomerArchived(state) {
    return state.customerFilters.archived;
  },

  getCustomerSortBy(state) {
    return state.customerFilters.sortBy;
  },

  getCustomerSortDescending(state) {
    return state.customerFilters.sortDescending;
  },

  getCustomerSearchTerm(state) {
    return state.customerFilters.searchTerm;
  },

  getCustomerSearchCriteria(state) {
    console.log("vlad", state);
    return state.customerFilters.searchCriteria;
  },

  getTimesheetSortBy(state) {
    return state.timesheetFilters.sortBy;
  },

  getTimesheetSearchTerm(state) {
    return state.timesheetFilters.searchTerm;
  }

}

export default getters;
