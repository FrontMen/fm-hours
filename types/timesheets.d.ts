declare enum TimesheetStatus {
  NEW = 'new',
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied',
  EMPTY = 'empty',
}

interface Message {
  id: string;
  text: string;
  createdAt: number;
  employeeName?: string;
}

interface Timesheet {
  id: string;
  date: number;
  employeeId: string;
  status: TimesheetStatus;
  messages: Message[];
  message?: string /** Only present on old timesheets with single comment */;
  workscheme?: WorkScheme[];
}

interface TimesheetTableField {
  key: string;
  label?: string;
  stickyColumn?: boolean;
  isRowHeader?: boolean;
  formatedStartDate?: string;
  formatedEndDate?: string;
  weekNumber?: number;
  isThisWeek?: boolean;
  timestamp?: number;
  timestampEnd?: number;
}

interface TimesheetTableItem extends Employee {
  [timestamp: string]: TimesheetStatus | null;
}

interface TimesheetTableData {
  fields: TimesheetTableField[];
  items: TimesheetTableItem[];
}

interface TimesheetDayTotal {
  day: WeekDate;
  hours: number;
  expected: number;
}

interface TimesheetTotals {
  weekTotal: number;
  expectedWeekTotal: number;
  days: TimesheetDayTotal[];
}

interface TimesheetEmployee extends Employee {
  status: TimesheetStatus;
  pendingTimeRecords: TimeRecord[];
  pendingTravelRecords: TravelRecord[];
}

type TimesheetErrorKey = 'bridge';

type TimesheetErrors = {
  [key in TimesheetErrorKey]?: boolean;
};

interface TimesheetsStoreState {
  timesheetTableData: TimesheetTableData;
  weeklyTimesheet: WeeklyTimesheet;
  isErrored: TimesheetErrors;
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
