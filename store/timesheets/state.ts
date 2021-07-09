export default (): TimesheetsStoreState => ({
  employees: [],
  selectedEmployeeId: "",
  timesheets: [],
  timesheetTableData: {} as TimesheetTableData,
  previousTimesheet: null,
});
