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
  projects: TimesheetProject[];
  travelProject: TimesheetProject | null;
}

interface RecordsStoreState {
  isLoading: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  selectedWeek: WeekDate[];
  timeRecords: TimeRecord[];
  travelRecords: TravelRecord[];
  workScheme: WorkScheme[];
}
