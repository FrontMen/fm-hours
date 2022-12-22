export default (): ReportsStoreState => ({
  isLoading: false,
  startDate: new Date(),
  reportData: {
    nonBillableProjects: [],
    employees: [],
  },
});
