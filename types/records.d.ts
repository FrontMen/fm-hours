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

interface ITimeRecordsRepository {
  getEmployeeRecords(
    params: {
      employeeId: string;
      startDate?: string;
      endDate?: string;
    },
    collection: string
  ): Promise<RecordType[]>;
  getRecords(params: {startDate: Date; endDate: Date}, collection: string): Promise<RecordType[]>;
  addBridgeWorklogs(params: {
    employeeId: string;
    bridgeUid: string;
    timeRecords: TimeRecord[];
    contracts: number[];
  }): Promise<void>;
  addBridgeWorklog(
    record: TimeRecord,
    contractId: number,
    bridgeUid: string,
    ref: any
  ): Promise<void>;
  removeBridgeWorklogs(timeRecords: TimeRecord[]): Promise<void>;
  removeBridgeWorklog(record: TimeRecord, ref: any): Promise<any>;
  saveEmployeeRecords(
    params: {
      employeeId: string;
      bridgeUid?: string;
      timeRecords: RecordType[];
      contracts?: number[];
    },
    collection: string
  ): Promise<Awaited<RecordType>[]>;
  deleteEmployeeRecords(params: {recordsToDelete: RecordType[]}, collection: string);
  getWeeklyRecords(params: {employeeId: string; startDate: Date}): Promise<WeeklyRecords>;
}

interface ITravelRecordsRepository {
  getEmployeeRecords(params: {
    employeeId: string;
    startDate?: string;
    endDate?: string;
  }): Promise<TravelRecord[]>;
  getRecords(params: {startDate: Date; endDate: Date}): Promise<TimeRecord[]>;
  saveEmployeeRecords(params: {
    employeeId: string;
    travelRecords: TravelRecord[];
  }): Promise<TravelRecord[]>;
}
