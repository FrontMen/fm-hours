interface ReportEmployee {
  name: string;
  bridgeUid?: string;
  team?: string;
  billable: boolean;
  billableRecords: TimeRecord[];
  nonBillableRecords: TimeRecord[];
  travelRecords: TravelRecord[];
  standByRecords: StandbyRecord[];
}

interface MonthlyReportData {
  nonBillableProjects: Customer[];
  employees: ReportEmployee[];
}

interface MonthlyReportPayload {
  startDate: Date;
  endDate: Date;
  employees: Employee[];
  timeRecords: TimeRecord[];
  travelRecords: TravelRecord[];
  standByRecords: StandbyRecord[];
  timesheets: Timesheet[];
  teams: Team[];
  customers: Customer[];
}

interface ReportsStoreState {
  isLoading: boolean;
  startDate: Date;
  reportData: MonthlyReportData;
}
