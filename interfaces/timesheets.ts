enum TimesheetStatus {
  NEW = 'new',
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied',
  EMPTY = 'empty',
}

interface WorkScheme {
  date: string;
  theoreticalHours: number;
  absenceHours: number;
  workHours: number;
  holiday: boolean;
}

interface Message {
  id: string;
  text: string;
  createdAt: number;
}
export interface Timesheet {
  id: string;
  date: number;
  employeeId: string;
  status: TimesheetStatus;
  messages: Message[];
  message?: string /** Only present on old timesheets with single comment */;
  workscheme?: WorkScheme[];
}
