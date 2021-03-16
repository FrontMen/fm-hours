interface TimesheetUser extends User {
  status: RecordStatus;
}

interface TimesheetsStoreState {
  users: TimesheetUser[];
}
