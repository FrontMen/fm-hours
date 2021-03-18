interface ReportUser {
  name: string;
  billableHours: number;
  billableRecords: TimeRecord[];
  nonBillableProjects: {
    customerId: string;
    hours: number;
  }[];
}

interface MonthlyReport {
  nonBillableProjects: Customer[];
  users: ReportUser[];
}

interface ReportsStoreState {
  isLoading: boolean;
  report: MonthlyReport | null;
}
