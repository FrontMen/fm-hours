interface ReportEmployee {
  name: string;
  billableRecords: TimeRecord[];
  nonBillableRecords: TimeRecord[];
  travelRecords: TravelRecord[];
}

interface MonthlyReportData {
  nonBillableProjects: Customer[];
  employees: ReportEmployee[];
}

interface ReportsStoreState {
  isLoading: boolean;
  reportData: MonthlyReportData | null;
}
