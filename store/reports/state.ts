export default (): ReportsStoreState => ({
  isLoading: false,
  reportData: {
    nonBillableProjects: [],
    employees: [],
  },
});
