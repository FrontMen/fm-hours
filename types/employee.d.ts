interface Employee {
  id: string;
  name: string;
  email: string;
  picture: string;
  travelAllowance: boolean;
  projects: string[];
  endDate: number | null;
  startDate: number;
  created: number;
  bridgeUid?: string;
  team?: string;
  standBy?: boolean;
}

interface EmployeeStoreState {
  employee: Employee | null;
}
