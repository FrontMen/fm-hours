declare enum RecordStatus {
  NEW = "new",
  PENDING = "pending",
  APPROVED = "approved",
  DENIED = "denied",
}

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
}

interface TimeRecord {
  id: string | null;
  date: number;
  customer: Customer;
  hours: number;
  status: RecordStatus;
  userId?: string;
}

interface TravelRecord {
  id: string | null;
  date: number;
  kilometers: number;
  status: RecordStatus;
  userId?: string;
}

interface TimesheetProject {
  customer: Customer;
  values: number[];
  ids: Array<string | null>;
  isExternal: boolean;
}

interface WeeklyTimesheet {
  isReadonly: boolean;
  projects: TimesheetProject[];
  travelProject: TimesheetProject | null;
  status: RecordStatus;
}

interface WorkScheme {
  date: string;
  theoreticalHours: number;
  absenceHours: number;
  workHours: number;
  holiday: number;
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
