import isAfter from "date-fns/isAfter";

export function checkEmployeeAvailability(
  employee: Employee,
  compareDate: Date
) {
  return !employee.endDate || isAfter(new Date(employee.endDate), compareDate);
}
