import {MutationTree} from 'vuex';

const mutations: MutationTree<ReportsStoreState> = {
  setIsLoading(state, payload: {isLoading: boolean}) {
    state.isLoading = payload.isLoading;
  },

  createMonthlyReportData(
    state,
    payload: {
      employees: Employee[];
      customers: Customer[];
      timeRecords: TimeRecord[];
      travelRecords: TravelRecord[];
      standByRecords: StandbyRecord[];
    }
  ) {
    const {employees, timeRecords, travelRecords, standByRecords} = payload;
    const nonBillableProjects = payload.customers.filter(
      (customer) => !customer.isBillable
    );

    const reportEmployees = employees.map((employee) => {
      const employeeTimeRecords = timeRecords.filter(
        (x) => x.employeeId === employee.id
      );

      const employeeTravelRecords = travelRecords.filter(
        (x) => x.employeeId === employee.id
      );

      const employeeStandByRecords = standByRecords.filter(
        (x) => x.employeeId === employee.id
      );

      const employeeNonBillableRecords = employeeTimeRecords.filter((x) =>
        nonBillableProjects.some((y) => y.id === x.customer.id)
      );

      const employeeBillableRecords = employeeTimeRecords.filter(
        (x) => !nonBillableProjects.some((y) => y.id === x.customer.id)
      );

      return {
        name: employee.name,
        team: employee.team,
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
