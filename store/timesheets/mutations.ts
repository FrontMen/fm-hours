import {MutationTree} from 'vuex';

const mutations: MutationTree<TimesheetsStoreState> = {
  setTimesheetsTableData: (state, payload: {tableData: TimesheetTableData}) => {
    state.timesheetTableData = payload.tableData;
  },
};

export default mutations;
