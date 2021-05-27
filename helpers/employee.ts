import { isAfter, endOfDay } from "date-fns";

// Check if employee has already started and is yet active in a given date or time span
export function checkEmployeeAvailability(
  employee: Employee,
  startCompareDate: Date,
  endCompareDate?: Date
) {
  const end = endCompareDate
    ? endOfDay(endCompareDate)
    : endOfDay(startCompareDate);

  if (end.getTime() < employee.startDate) {
    return false;
  }

  return (
    !employee.endDate || isAfter(new Date(employee.endDate), startCompareDate)
  );
}
