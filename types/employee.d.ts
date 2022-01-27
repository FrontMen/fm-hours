interface Employee {
  id: string;
  name: string;
  email: string;
  picture: string;
  travelAllowance: boolean;
  billable: boolean | undefined; // undefined is for the "old" profiles where this boolean is not set
  projects: string[];
  endDate: number | null;
  startDate: number;
  created: number;
  bridgeUid?: string;
  team?: string;
  standBy: boolean;
}

interface EmployeeStoreState {
  employee: Employee | null;
  isAdmin: boolean;
  projects: Customer[];
}
