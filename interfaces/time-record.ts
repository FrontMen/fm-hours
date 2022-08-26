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

export interface WeekDate {
  date: string;
  weekDay: string;
  weekDayShort: string;
  monthDay: string;
  month: string;
  year: string;
  isWeekend: boolean;
  isToday: boolean;
  isHoliday: boolean;
  isLeaveDay: boolean;
  isPartTime: Boolean;
}

export interface WeekSpan {
  start: {
    date: number;
    formatedDate: string;
    ISO: string;
  };
  end: {
    date: number;
    formatedDate: string;
    ISO: string;
  };
}

export interface StandbyRecord {
  id: string | null;
  date: number;
  hours: number;
  employeeId?: string;
}

export interface TravelRecord {
  id: string | null;
  date: number;
  kilometers: number;
  employeeId?: string;
}

export interface RecordDayStatus {
  prop: string;
  SHORT: string;
  MID: string;
  LONG: string;
}
