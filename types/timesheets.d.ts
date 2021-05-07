interface TimesheetEmployee extends Employee {
  status: RecordStatus;
  pendingTimeRecords: TimeRecord[];
  pendingTravelRecords: TravelRecord[];
}

interface TimesheetPendingWeek {
  week: WeekDate[];
}

interface TimesheetsStoreState {
  employees: TimesheetEmployee[];
  selectedEmployeeId: string;
  weeklyTimesheetsStatus: WeeklyTimesheetStatus[];
}

interface WeeklyTimesheetStatus {
  id: string;
  startDate: number;
  endDate: number;
  employeeId: string;
  timeRecordIds: string[];
  travelRecordIds: string[];
  status: RecordStatus;
}
