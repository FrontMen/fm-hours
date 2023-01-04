interface EmployeeProject {
  customerId: string;
  contract?: Contract;
}

interface Project {
  id: string;
  customer: Customer;
  contract: Contract | null;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  travelAllowance: boolean;
  billable: boolean;
  projects: EmployeeProject[];
  endDate: number | null;
  startDate: number;
  created: number;
  bridgeUid?: string;
  team?: string;
  standBy: boolean;
  isAdmin: boolean;
}

interface EmployeeStoreState {
  employee: Employee | null;
  isFound: boolean;
}
