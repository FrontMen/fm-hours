interface ReportEmployee {
  name: string;
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

interface ReportsStoreState {
  isLoading: boolean;
  reportData: MonthlyReportData | null;
}
