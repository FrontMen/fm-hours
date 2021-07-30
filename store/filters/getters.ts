import {GetterTree} from 'vuex';

const getters: GetterTree<FiltersStoreState, RootStoreState> = {
  // Customers
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
    return state.customerFilters.searchCriteria;
  },

  // Timesheets
  getTimesheetFilterBy(state) {
    return state.timesheetFilters.filterBy;
  },

  getTimesheetSortDescending(state) {
    return state.timesheetFilters.sortDescending;
  },

  // Employee
  getEmployeeFilterBy(state): keyof Employee {
    return state.employeeFilters.filterBy;
  },

  getEmployeeShowInactive(state): boolean {
    return state.employeeFilters.showInactive;
  },

  getEmployeeSearchTerm(state) {
    return state.employeeFilters.searchTerm;
  },
};

export default getters;
