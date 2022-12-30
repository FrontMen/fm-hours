export default (): TimesheetsStoreState => ({
  timesheetTableData: {} as TimesheetTableData,
  weeklyTimesheet: {
    info: null,
    week: [],
    projects: [],
    leaveDays: null,
    travelProject: null,
    standByProject: null,
    workScheme: [],
  } as WeeklyTimesheet,
  isErrored: {
    bridge: false,
  },
});
