interface ReportUser {
  name: string;
  billableRecords: TimeRecord[];
  nonBillableRecords: TimeRecord[];
  travelRecords: TravelRecord[];
}

interface MonthlyReportData {
  nonBillableProjects: Customer[];
  users: ReportUser[];
}

interface ReportsStoreState {
  isLoading: boolean;
  reportData: MonthlyReportData | null;
}
