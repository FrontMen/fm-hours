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
}

interface EmployeeStoreState {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  employee: Employee | null;
  errorMessage: string;
}
