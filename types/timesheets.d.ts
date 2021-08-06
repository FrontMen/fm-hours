declare enum TimesheetStatus {
  NEW = 'new',
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied',
  EMPTY = 'empty',
}

interface TimesheetTotals {
  weekTotal: number;
  expectedWeekTotal: number;
  dayTotal: number[];
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

interface Message {
  id: string;
  text: string;
  createdAt: number;
}

interface Timesheet {
  id: string;
  date: number;
  employeeId: string;
  status: TimesheetStatus;
  reasonOfDenial: string;
  messages?: Message[];
  message?: string /** Only present on old timesheets with single comment */;
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
  weekNumber?: number;
  timestamp?: number;
  timestampEnd?: number;
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

interface EmailData {
  to: string;
  subject: string;
  html: string;
}
