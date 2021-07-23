import {isSameISOWeek} from 'date-fns';

import {getDayOnGMT} from './dates';

export const recordStatus = {
  NEW: 'new',
  PENDING: 'pending',
  APPROVED: 'approved',
  DENIED: 'denied',
  EMPTY: 'empty',
};

export function filterApprovedRecords<T extends TimeRecord | TravelRecord>(
  records: T[],
  timesheets: Timesheet[]
) {
  return records.reduce((approveds, record) => {
    const recordTimesheet = timesheets.find(
      (timesheet) =>
        record.employeeId === timesheet.employeeId &&
        isSameISOWeek(getDayOnGMT(record.date), getDayOnGMT(timesheet.date))
    );

    if (recordTimesheet && recordTimesheet.status === recordStatus.APPROVED) {
      approveds.push(record);
    }

    return approveds;
  }, [] as T[]);
}
