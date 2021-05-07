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
  timesheets: Timesheet[];
}

interface Timesheet {
  id: string;
  date: number;
  employeeId: string;
  status: TimesheetStatus;
}
