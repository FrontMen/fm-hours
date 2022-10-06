import {isSameISOWeek} from 'date-fns';

import {getDayOnGMT} from './dates';
import {
  TimeRecord,
  StandbyRecord,
  TravelRecord,
  WeekDate,
  RecordDayStatus,
} from '~/interfaces/time-record';
import {Timesheet} from '~/interfaces/timesheets';

export const recordStatus = {
  NEW: 'new',
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
  EMPTY: 'empty',
};

export function filterApprovedRecords<T extends TimeRecord | TravelRecord | StandbyRecord>(
  records: T[],
  timesheets: Timesheet[]
) {
  return records.reduce((approveds, record) => {
    const recordTimesheet = timesheets.find(
      timesheet =>
        record.employeeId === timesheet.employeeId &&
        isSameISOWeek(getDayOnGMT(record.date), getDayOnGMT(timesheet.date))
    );

    if (recordTimesheet && recordTimesheet.status === recordStatus.APPROVED) {
      approveds.push(record);
    }

    return approveds;
  }, [] as T[]);
}

export const recordDayStatus: RecordDayStatus[] = [
  {
    prop: 'isToday',
    SHORT: 'T',
    MID: 'TDY',
    LONG: 'TODAY',
  },
  {
    prop: 'isHoliday',
    SHORT: 'H',
    MID: 'HOLI',
    LONG: 'HOLIDAY',
  },
  {
    prop: 'isLeaveDay',
    SHORT: 'L',
    MID: 'LVD',
    LONG: 'LEAVE',
  },
  {
    prop: 'isPartTime',
    SHORT: 'P',
    MID: 'PTD',
    LONG: 'PART-TIME',
  },
];

export const recordDayStatusProps = recordDayStatus.map(status => status.prop) as Array<
  keyof WeekDate
>;
