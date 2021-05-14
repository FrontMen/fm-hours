import { isSameISOWeek } from "date-fns";

export const recordStatus = {
  NEW: "new",
  PENDING: "pending",
  APPROVED: "approved",
  DENIED: "denied",
  EMPTY: "empty",
};

export function filterApprovedRecords<T extends TimeRecord | TravelRecord>(
  records: T[],
  timesheets: Timesheet[]
) {
  return records.reduce((approveds, record) => {
    const recordTimesheet = timesheets.find(
      (timesheet) =>
        record.employeeId === timesheet.employeeId &&
        isSameISOWeek(record.date, timesheet.date)
    );

    if (recordTimesheet && recordTimesheet.status === recordStatus.APPROVED) {
      approveds.push(record);
    }

    return approveds;
  }, [] as T[]);
}
