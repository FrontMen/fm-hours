/* eslint-disable camelcase */
import {ActionTree} from 'vuex';
import {AxiosError} from 'axios';

import {createTimesheetTableData} from '~/helpers/timesheet';
import {checkEmployeeAvailability} from '~/helpers/employee';
import {getWeeksInMonth} from '~/helpers/dates';
import {recordStatus} from '~/helpers/record-status';
import {uuidv4} from '~/helpers/helpers';

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
  async getWeeklyTimesheet(
    {dispatch, commit, rootState},
    {
      employee,
      startDate,
      checkOwnWorkScheme = true,
    }: {
      employee: Employee;
      startDate: Date;
      checkOwnWorkScheme: boolean;
    }
  ) {
    const isOwnTimesheet = rootState.employee.employee?.id === employee.id;

    try {
      const weeklyTimesheet = await this.app.$timesheetsService.getWeeklyTimesheet({
        employeeId: employee.id,
        startDate,
        checkOwnWorkScheme,
        isOwnTimesheet,
      });

      commit('setWeeklyTimesheet', {weeklyTimesheet});
      commit('setIsErrored', {key: 'bridge', value: false});
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        dispatch('auth/logout');
      } else {
        commit('setIsErrored', {key: 'bridge', value: true});
      }
    }
  },
  async getWorkScheme(
    {dispatch, commit, rootState},
    {
      employee,
      sheet,
      workWeek,
      checkOwn,
    }: {
      employee: Employee;
      sheet: Optional<Timesheet, 'id'>;
      workWeek: WeekDate[];
      checkOwn: boolean;
    }
  ): Promise<WorkScheme[]> {
    let workScheme: WorkScheme[] | undefined = [];
    const isOwnTimesheet = rootState.employee.employee?.id === employee.id;

    if (sheet.status === recordStatus.NEW && (!checkOwn || isOwnTimesheet)) {
      try {
        workScheme = await this.app.$workSchemeService.getWorkScheme({
          bridgeUid: employee.bridgeUid || '',
          startDate: new Date(workWeek[0].date),
          endDate: new Date(workWeek[6].date),
        });
        commit('setIsErrored', {key: 'bridge', value: false});
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          dispatch('auth/logout');
        } else {
          commit('setIsErrored', {key: 'bridge', value: true});
        }
      }
    } else {
      workScheme = sheet.workscheme;
    }
    return workScheme || [];
  },
  async save({state, commit}): Promise<void> {
    const {weeklyTimesheet} = state;
    const sheet = {
      ...weeklyTimesheet.info,
      workscheme: weeklyTimesheet.workScheme,
    } as Optional<Timesheet, 'id'>;

    const info = await this.app.$timesheetsService.saveTimesheet(sheet);
    commit('setTimesheetInfo', {info});
  },
  addMessage({commit}, {text, employeeName}: {text: string; employeeName: string}): void {
    const message = {
      id: uuidv4(),
      createdAt: new Date().getTime(),
      text,
      employeeName,
    };

    commit('addMessage', {message});
  },
};

export default actions;
