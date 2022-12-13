/* eslint-disable camelcase */
import {ActionTree} from 'vuex';

import {createTimesheetTableData} from '~/helpers/timesheet';
import {getWeeksInMonth} from '~/helpers/dates';
import {checkEmployeeAvailability} from '~/helpers/employee';

const actions: ActionTree<TimesheetsStoreState, RootStoreState> = {
  async getTableData(
    {commit},
    payload: {
      startDate: Date;
      endDate: Date;
    }
  ) {
    const weeksSpan = getWeeksInMonth(payload.startDate, payload.endDate);

    const employeesPromise = this.app.$employeesService.getAll();
    const timesheetsPromise = this.app.$timesheetsService.getTimesheets({
      startDate: payload.startDate.getTime(),
      endDate: payload.endDate.getTime(),
    });

    const [employees, timesheets] = await Promise.all([employeesPromise, timesheetsPromise]);

    const activeEmployees = employees.filter(employee => {
      const isBillable = employee.billable || employee.billable === undefined;
      const isAvailable = checkEmployeeAvailability(employee, payload.startDate, payload.endDate);
      return isBillable && isAvailable;
    });

    const tableData = createTimesheetTableData({
      employees: activeEmployees,
      timesheets,
      weeksSpan,
    });

    commit('setTimesheetsTableData', {tableData});
  },
};

export default actions;
