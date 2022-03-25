interface EmployeeProject {
  customerId: string;
  contract?: Contract;
}

interface Project {
  customer: Customer;
  contract: Contract | null;
}

interface Employee {
  id: string;
  name: string;
  email: string;
  picture: string;
  travelAllowance: boolean;
  billable: boolean;
  projects: string[] | EmployeeProject[];
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
}
