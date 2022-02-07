/* eslint-disable camelcase */
import {ActionTree} from 'vuex';

import {createTimesheetTableData} from '~/helpers/timesheet';
import {getWeeksInMonth} from '~/helpers/dates';

const actions: ActionTree<TimesheetsStoreState, RootStoreState> = {
  async getTableData(
    {commit},
    payload: {
      startDate: Date;
      endDate: Date;
    }
  ) {
    const weeksSpan = getWeeksInMonth(payload.startDate, payload.endDate);

    const employeesPromise = this.app.$employeesService.getEmployees();
    const timesheetsPromise = this.app.$timesheetsService.getTimesheets({
      startDate: payload.startDate.getTime(),
      endDate: payload.endDate.getTime(),
    });

    const [employees, timesheets] = await Promise.all([employeesPromise, timesheetsPromise]);

    const tableData = createTimesheetTableData({
      employees,
      timesheets,
      weeksSpan,
    });

    commit('setTimesheetsTableData', {tableData});
  },
};

export default actions;
