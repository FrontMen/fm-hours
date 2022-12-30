import {MutationTree} from 'vuex';

const mutations: MutationTree<TimesheetsStoreState> = {
  setTimesheetsTableData: (state, payload: {tableData: TimesheetTableData}) => {
    state.timesheetTableData = payload.tableData;
  },
  setWeeklyTimesheet: (state, payload: {weeklyTimesheet: WeeklyTimesheet}) => {
    state.weeklyTimesheet = payload.weeklyTimesheet;
  },
  setIsErrored: (state, {key, value}: {key: TimesheetErrorKey; value: boolean}) => {
    state.isErrored[key] = value;
  },
};

export default mutations;
