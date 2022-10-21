import {Contract} from './contract';

interface EmployeeProject {
  customerId: string;
  contract?: Contract;
}

export interface Employee {
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
  isAdmin: boolean;
}
