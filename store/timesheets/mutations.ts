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
  setProjectValues: (state, {projectId, values}: {projectId: string; values: number[]}) => {
    const projectIndex = state.weeklyTimesheet.projects.findIndex(
      project => project.project.id === projectId
    );
    state.weeklyTimesheet.projects[projectIndex].values = values;
  },
  setTimesheetInfo: (state, {info}: {info: Optional<Timesheet, 'id'>}) => {
    state.weeklyTimesheet.info = info;
  },
  setTimesheetStatus: (state, {status}: {status: TimesheetStatus}) => {
    if (!state.weeklyTimesheet.info) return;
    state.weeklyTimesheet.info.status = status;
  },
};

export default mutations;
