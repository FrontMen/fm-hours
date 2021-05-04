interface Employee {
  id: string;
  name: string;
  picture: string;
  travelAllowance: boolean;
  projects: string[];
  endDate: number | null;
}

interface EmployeeStoreState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  employee: Employee | null;
}
