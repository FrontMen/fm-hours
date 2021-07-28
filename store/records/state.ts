export default (): RecordsStoreState => ({
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  selectedWeek: [],
  timeRecords: [],
  travelRecords: [],
  leaveDays: [],
  standByRecords: [],
  workScheme: [],
});
