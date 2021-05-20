import { isAfter, endOfDay } from "date-fns";

// Check if employee was already created and yet active in a given date or time span
export function checkEmployeeAvailability(
  employee: Employee,
  startCompareDate: Date,
  endCompareDate?: Date
) {
  const end = endCompareDate
    ? endOfDay(endCompareDate)
    : endOfDay(startCompareDate);

  if (end.getTime() < employee.created) {
    return false;
  }

  return (
    !employee.endDate || isAfter(new Date(employee.endDate), startCompareDate)
  );
}
