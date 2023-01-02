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
  worklogId?: number | null;
}

interface TravelRecord {
  id: string | null;
  date: number;
  kilometers: number;
  employeeId?: string;
}

interface TimesheetProject {
  project: Project;
  values: number[];
  ids: Array<string | null>;
  worklogs?: Array<number | null>;
}

interface WeeklyRecords {
  sheet: Optional<Timesheet, 'id'> | null;
  week: WeekDate[];
  timeRecords: TimeRecord[];
  travelRecords: TravelRecord[];
  standByRecords: StandbyRecord[];
}

interface WeeklyTimesheet {
  info: Optional<Timesheet, 'id'> | null;
  week: WeekDate[];
  projects: TimesheetProject[];
  leaveDays: TimesheetProject | null;
  travelProject: TimesheetProject | null;
  standByProject: TimesheetProject | null;
  workScheme: WorkScheme[] | null;
}

interface RecordsStoreState {
  timeRecords: TimeRecord[];
}

interface RecordDayStatus {
  prop: string;
  SHORT: string;
  MID: string;
  LONG: string;
}
