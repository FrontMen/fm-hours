export default (): FiltersStoreState => ({
  customerFilters: {
    archived: false,
    searchTerm: null,
    searchCriteria: 'name',
    sortDescending: false,
    sortBy: '',
  },
  timesheetFilters: {
    searchTerm: null,
    sortBy: '',
  },
});
