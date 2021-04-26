import { MutationTree } from "vuex";

const mutations: MutationTree<TimesheetsStoreState> = {
  setTimesheetEmployees: (
    state,
    payload: { employees: TimesheetEmployee[] }
  ) => {
    state.employees = payload.employees;
  },

  setSelectedEmployeeId: (state, payload: { employeeId: string }) => {
    state.selectedEmployeeId = payload.employeeId;
  },
};

export default mutations;
