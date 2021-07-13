type FiltersStoreState = {
  customerFilters: {
    archived: boolean;
    searchTerm: null|string;
    searchCriteria: 'name'|'debtor';
    sortDescending: boolean;
    sortBy: string;
  },
  timesheetFilters: {
    filterBy: null|string;
    sortDescending: boolean;
  },
  employeeFilters: {
    searchTerm: string;
    filterBy: string;
    filterByCustomer: string[];
  },
}
