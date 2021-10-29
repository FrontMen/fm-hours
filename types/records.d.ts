interface WeekDate {
  date: string;
  weekDay: string;
  weekDayShort: string;
  monthDay: string;
  month: string;
  year: string;
  isWeekend: boolean;
  isToday: boolean;
  isHoliday: boolean;
  isLeaveDay: boolean;
  isPartTime: Boolean;
}

interface StandbyRecord {
  id: string | null;
  date: number;
  hours: number;
  employeeId?: string;
}
interface TimeRecord {
  id: string | null;
  date: number;
  customer: Customer;
  hours: number;
  employeeId?: string;
}

interface TravelRecord {
  id: string | null;
  date: number;
  kilometers: number;
  employeeId?: string;
}

interface TimesheetProject {
  customer: Customer;
  values: number[];
  ids: Array<string | null>;
  isExternal: boolean;
}

interface WeeklyTimesheet {
  info: Timesheet | null;
  week: WeekDate[];
  projects: TimesheetProject[];
  leaveDays: TimesheetProject | null;
  travelProject: TimesheetProject | null;
  standByProject: TimesheetProject | null;
  workScheme: WorkScheme[];
}

interface RecordsStoreState {
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  selectedWeek: WeekDate[];
  leaveDays: WeekDate[];
  timeRecords: TimeRecord[];
  travelRecords: TravelRecord[];
  workScheme: WorkScheme[];
  standByRecords: StandbyRecord[];
  errorMessage: string;
  errorMessageWorkscheme: string;
}

interface RecordDayStatus {
  prop: string;
  SHORT: string;
  MID: string;
  LONG: string;
}
