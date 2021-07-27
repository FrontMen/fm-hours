import {startOfMonth, addMonths, startOfISOWeek} from 'date-fns';
import {ActionTree} from 'vuex';

import {checkEmployeeAvailability} from '../../helpers/employee';
import {filterApprovedRecords} from '~/helpers/record-status';
import {getDayOnGMT} from '~/helpers/dates';

const actions: ActionTree<ReportsStoreState, RootStoreState> = {
  async getMonthlyReportData({commit}, payload: {startDate: Date}) {
    commit('setIsLoading', {isLoading: true});

    const startDate = startOfMonth(payload.startDate);
    const endDate = startOfMonth(addMonths(payload.startDate, 1));

    const customersPromise = this.app.$customersService.getCustomers();
    const employeesPromise = this.app.$employeesService.getEmployees();
    const timesheetsPromise = this.app.$timesheetsService.getApprovedTimesheets(
      {
        startDate: getDayOnGMT(startOfISOWeek(startDate)).getTime(),
        endDate: endDate.getTime(),
      }
    );
    const timeRecordsPromise =
      this.app.$timeRecordsService.getRecords<TimeRecord>({
        startDate,
        endDate,
      });
    const travelRecordsPromise = this.app.$travelRecordsService.getRecords({
      startDate,
      endDate,
    });

    const [customers, employees, timesheets, timeRecords, travelRecords] =
      await Promise.all([
        customersPromise,
        employeesPromise,
        timesheetsPromise,
        timeRecordsPromise,
        travelRecordsPromise,
      ]);

    const approvedTimeRecords = filterApprovedRecords(timeRecords, timesheets);

    const approvedTravelRecords = filterApprovedRecords(
      travelRecords,
      timesheets
    );

    const activeEmployees = employees.filter((employee) =>
      checkEmployeeAvailability(employee, startDate, endDate)
    );

    commit('setIsLoading', {isLoading: false});
    commit('createMonthlyReportData', {
      employees: activeEmployees,
      customers,
      timeRecords: approvedTimeRecords,
      travelRecords: approvedTravelRecords,
    });
  },
};

export default actions;
