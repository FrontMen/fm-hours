import {MutationTree} from 'vuex';
import {standardProjectIds} from '~/helpers/timesheet';

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

    if (!Object.values(standardProjectIds).includes(projectId)) {
      state.weeklyTimesheet.projects[projectIndex].values = values;
      // eslint-disable-next-line no-useless-return
      return;
    }

    if (
      projectId === standardProjectIds.STAND_BY_RECORD_ID &&
      state.weeklyTimesheet.standByProject
    ) {
      state.weeklyTimesheet.standByProject.values = values;
    }

    if (projectId === standardProjectIds.TRAVEL_PROJECT_ID && state.weeklyTimesheet.travelProject) {
      state.weeklyTimesheet.travelProject.values = values;
    }
  },
  setTimesheetInfo: (state, {info}: {info: Optional<Timesheet, 'id'>}) => {
    state.weeklyTimesheet.info = info;
  },
  setTimesheetStatus: (state, {status}: {status: TimesheetStatus}) => {
    if (!state.weeklyTimesheet.info) return;
    state.weeklyTimesheet.info.status = status;
  },
  addMessage: (state, {message}: {message: Message}) => {
    if (!state.weeklyTimesheet.info) return;
    state.weeklyTimesheet.info.messages = [...state.weeklyTimesheet.info.messages, message];
  },
};

export default mutations;
