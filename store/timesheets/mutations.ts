import {MutationTree} from 'vuex';

const mutations: MutationTree<TimesheetsStoreState> = {
  setTimesheetEmployees: (state, payload: {employees: TimesheetEmployee[]}) => {
    state.employees = payload.employees;
  },

  setSelectedEmployeeId: (state, payload: {employeeId: string}) => {
    state.selectedEmployeeId = payload.employeeId;
  },

  setTimesheets: (state, payload: {timesheets: Timesheet[]}) => {
    state.timesheets = payload.timesheets;
  },

  setPreviousTimesheet: (state, payload: {timesheet: Timesheet}) => {
    state.previousTimesheet = payload.timesheet;
  },

  setTimesheetsTableData: (state, payload: {tableData: TimesheetTableData}) => {
    state.timesheetTableData = payload.tableData;
  },
};

export default mutations;
