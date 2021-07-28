interface ReportEmployee {
  name: string;
  billableRecords: TimeRecord[];
  nonBillableRecords: TimeRecord[];
  travelRecords: TravelRecord[];
  standByRecords: StandbyRecord[];
}

interface MonthlyReportData {
  nonBillableProjects: Customer[];
  employees: ReportEmployee[];
}

interface ReportsStoreState {
  isLoading: boolean;
  reportData: MonthlyReportData | null;
}
