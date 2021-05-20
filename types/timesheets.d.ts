declare enum TimesheetStatus {
  NEW = "new",
  PENDING = "pending",
  APPROVED = "approved",
  DENIED = "denied",
  EMPTY = "empty",
}

interface TimesheetEmployee extends Employee {
  status: TimesheetStatus;
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
  timesheetTableData: TimesheetTableData;
}

interface Timesheet {
  id: string;
  date: number;
  employeeId: string;
  status: TimesheetStatus;
  reasonOfDenial: string;
  message: string;
}

interface WeekSpan {
  start: {
    date: number;
    formatedDate: string;
    ISO: string;
  };
  end: {
    date: number;
    formatedDate: string;
    ISO: string;
  };
}

interface TimesheetTableItem extends Employee {
  [timestamp: string]: TimesheetStatus | null;
}

interface TimesheetTableField {
  key: string;
  label?: string;
  stickyColumn?: boolean;
  isRowHeader?: boolean;
  formatedStartDate?: string;
  formatedEndDate?: string;
}

interface TimesheetTableData {
  fields: TimesheetTableField[];
  items: TimesheetTableItem[];
}

interface GetTimesheetsProps {
  startDate?: number;
  endDate?: number;
  employeeId?: string;
  date?: number;
}
