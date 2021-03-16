interface TimesheetUser extends User {
  status: RecordStatus;
  pendingTimeRecords: TimeRecord[];
  pendingTravelRecords: TravelRecord[];
}

interface TimesheetPendingWeek {
  week: WeekDate[];
}

interface TimesheetsStoreState {
  users: TimesheetUser[];
}
