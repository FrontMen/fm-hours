type FiltersStoreState = {
  customerFilters: {
    archived: boolean;
    searchTerm: null|string;
    searchCriteria: 'name'|'debtor';
    sortDescending: boolean;
    sortBy: string;
  },
  timesheetFilters: {
    searchTerm: null|string;
    sortBy: string;
  },
}
