interface Employee {
  id: string;
  active: boolean;
  name: string;
  picture: string;
  travelAllowance: boolean;
  projects: string[];
}

interface EmployeeStoreState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  employee: Employee | null;
}
