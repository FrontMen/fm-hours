import {Customer} from './customer';

export interface TimeRecord {
  id: string | null;
  date: number;
  customer: Customer;
  hours: number;
  employeeId?: string;
  worklogId?: number | null;
}

export interface RecordType {
  id: string | null;
  hours: number;
}
