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
}

interface TimesheetProjectValue {
  date: string
  value: number
}

interface TimesheetProject {
  customer: Customer
  values: TimesheetProjectValue[]
}

interface WeeklyTimesheet {
  isReadonly: boolean
  projects: TimesheetProject[]
  travelRecords: TravelRecord[]
}

interface RecordsStoreState {
  isLoading: boolean
  isSaving: boolean
  lastSaved: Date | null
  selectedWeek: WeekDate[]
  timeRecords: TimeRecord[]
  travelRecords: TravelRecord[]
}
