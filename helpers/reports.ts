import {isAfter, isBefore} from 'date-fns';

export function createMonthlyReportData(payload: MonthlyReportPayload): MonthlyReportData {
  const {
    startDate,
    endDate,
    employees,
    timeRecords,
    travelRecords,
    standByRecords,
    timesheets,
    teams,
    customers,
  } = payload;

  const nonBillableProjects = customers.filter(
    (customer: Customer) => !customer.isBillable && !customer.archived
  );

  // Add fake Leave project
  const leaveCustomer = {
    id: 'leave-bridge',
    name: 'Leave (Bridge)',
    isBillable: false,
    isDefault: false,
  };
  nonBillableProjects.unshift(leaveCustomer);

  const reportEmployees = employees.map((employee: Employee) => {
    const employeeTimeRecords = timeRecords.filter((x: TimeRecord) => x.employeeId === employee.id);

    const employeeTimesheets = timesheets.filter((x: Timesheet) => x.employeeId === employee.id);

    const employeeTravelRecords = travelRecords.filter(
      (x: TravelRecord) => x.employeeId === employee.id
    );

    const employeeStandByRecords = standByRecords.filter(
      (x: StandbyRecord) => x.employeeId === employee.id
    );

    const employeeNonBillableRecords = employeeTimeRecords.filter((x: TimeRecord) =>
      nonBillableProjects.some((y: Customer) => y.id === x.customer.id)
    );

    // Add leave hours as fake TimeRecords
    employeeTimesheets.forEach((sheet: Timesheet) => {
      if (!sheet.workscheme) return;

      sheet.workscheme.forEach((scheme: WorkScheme) => {
        if (scheme.absenceHours <= 0) return;

        const date = new Date(scheme.date);

        if (!isAfter(date, startDate) || !isBefore(date, endDate)) return;

        employeeNonBillableRecords.push({
          id: null,
          date: date.getTime(),
          customer: leaveCustomer,
          hours: scheme.absenceHours,
          employeeId: employee.id,
        });
      });
    });

    const employeeBillableRecords = employeeTimeRecords.filter(
      (x: TimeRecord) => !nonBillableProjects.some((y: Customer) => y.id === x.customer.id)
    );

    const teamName = teams.find((t: Team) => t.id === employee.team)?.name;

    return {
      name: employee.name,
      bridgeUid: employee.bridgeUid,
      team: teamName,
      billable: employee.billable,
      travelRecords: employeeTravelRecords,
      billableRecords: employeeBillableRecords,
      nonBillableRecords: employeeNonBillableRecords,
      standByRecords: employeeStandByRecords,
    };
  });

  return {
    nonBillableProjects,
    employees: reportEmployees,
  };
}
