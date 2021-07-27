export default (): RecordsStoreState => ({
  isLoading: false,
  isSaving: false,
  lastSaved: null,
  selectedWeek: [],
  timeRecords: [],
  travelRecords: [],
  workScheme: [],
});
