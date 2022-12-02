import {MutationTree} from 'vuex';
import {isAfter, isBefore} from 'date-fns';

const mutations: MutationTree<ReportsStoreState> = {
  setIsLoading(state, payload: {isLoading: boolean}) {
    state.isLoading = payload.isLoading;
  },

  createMonthlyReportData(
    state,
    payload: {
      startDate: Date;
      endDate: Date;
      employees: Employee[];
      customers: Customer[];
      timeRecords: TimeRecord[];
      travelRecords: TravelRecord[];
      standByRecords: StandbyRecord[];
      timesheets: Timesheet[];
      teams: Team[];
    }
  ) {
    const {
      startDate,
      endDate,
      employees,
      timeRecords,
      travelRecords,
      standByRecords,
      timesheets,
      teams,
    } = payload;
    const nonBillableProjects = payload.customers.filter(
      customer => !customer.isBillable && !customer.archived
    );

    // Add fake Leave project
    const leaveCustomer = {
      id: 'leave-bridge',
      name: 'Leave (Bridge)',
      isBillable: false,
      isDefault: false,
    };
    nonBillableProjects.unshift(leaveCustomer);

    const reportEmployees = employees.map(employee => {
      const employeeTimeRecords = timeRecords.filter(x => x.employeeId === employee.id);

      const employeeTimesheets = timesheets.filter(x => x.employeeId === employee.id);

      const employeeTravelRecords = travelRecords.filter(x => x.employeeId === employee.id);

      const employeeStandByRecords = standByRecords.filter(x => x.employeeId === employee.id);

      const employeeNonBillableRecords = employeeTimeRecords.filter(x =>
        nonBillableProjects.some(y => y.id === x.customer.id)
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
        x => !nonBillableProjects.some(y => y.id === x.customer.id)
      );

      const teamName = teams.find(t => t.id === employee.team)?.name;

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

    state.reportData = {
      nonBillableProjects,
      employees: reportEmployees,
    };
  },
};

export default mutations;
