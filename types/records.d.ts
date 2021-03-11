declare enum RecordStatus {
  NEW = "new",
  PENDING = "pending",
  APPROVED = "approved",
  DENIED = "denied",
}

interface TimeRecord {
  date: string;
  customer: Customer;
  hours: number;
  status: RecordStatus;
}

interface TravelRecord {
  date: string;
  kilometers: number;
  status: RecordStatus;
}

interface TimesheetProject {
  customer: Customer
  values: number[]
}

interface WeeklyTimesheet {
  isReadonly: boolean
  projects: TimesheetProject[]
  travelProject: TimesheetProject | null
}

interface RecordsStoreState {
  isLoading: boolean
  isSaving: boolean
  lastSaved: Date | null
  selectedWeek: WeekDate[]
  timeRecords: TimeRecord[]
  travelRecords: TravelRecord[]
}
