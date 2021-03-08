export default (): RecordsStoreState => ({
  isSaving: false,
  isLoading: false,
  lastSaved: null,
  selectedWeek: [],
  timeRecords: [],
  travelRecords: [],
})
