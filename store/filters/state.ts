export default (): FiltersStoreState => ({
  customerFilters: {
    archived: false,
    searchTerm: null,
    searchCriteria: 'name',
    sortDescending: false,
    sortBy: '',
  },
  timesheetFilters: {
    filterBy: null,
    sortDescending: false,
  },
  employeeFilters: {
    searchTerm: '',
    filterBy: 'all',
    filterByCustomer: [],
    showInactive: false,
  },
});
