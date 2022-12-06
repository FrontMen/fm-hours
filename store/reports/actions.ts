import {addMonths, startOfISOWeek, startOfMonth} from 'date-fns';
import {ActionTree} from 'vuex';

import {checkEmployeeAvailability} from '~/helpers/employee';
import {Collections} from '~/types/enums';
import {filterApprovedRecords} from '~/helpers/record-status';
import {getDayOnGMT} from '~/helpers/dates';

const actions: ActionTree<ReportsStoreState, RootStoreState> = {
  async getMonthlyReportData({commit}, payload: {startDate: Date}) {
    commit('setIsLoading', {isLoading: true});

    const startDate = startOfMonth(payload.startDate);
    const endDate = startOfMonth(addMonths(payload.startDate, 1));

    const customersPromise = this.app.$customersService.getCustomers();
    const employeesPromise = this.app.$employeesService.getAll();
    const teamsPromise = this.app.$teamsService.getAll();
    const timesheetsPromise = this.app.$timesheetsService.getApprovedTimesheets({
      startDate: getDayOnGMT(startOfISOWeek(startDate)).getTime(),
      endDate: endDate.getTime(),
    });
    const timeRecordsPromise = this.app.$timeRecordsService.getRecords<TimeRecord>({
      startDate,
      endDate,
    });
    const standByRecordsPromise = this.app.$timeRecordsService.getRecords<StandbyRecord>(
      {
        startDate,
        endDate,
      },
      Collections.STANDBYREC
    );
    const travelRecordsPromise = this.app.$travelRecordsService.getRecords({
      startDate,
      endDate,
    });

    const [customers, employees, teams, timesheets, timeRecords, travelRecords, standByRecords] =
      await Promise.all([
        customersPromise,
        employeesPromise,
        teamsPromise,
        timesheetsPromise,
        timeRecordsPromise,
        travelRecordsPromise,
        standByRecordsPromise,
      ]);

    const approvedTimeRecords = filterApprovedRecords(timeRecords, timesheets);
    const approvedStandByRecords = filterApprovedRecords(standByRecords, timesheets);
    const approvedTravelRecords = filterApprovedRecords(travelRecords, timesheets);

    const activeEmployees = employees.filter(employee =>
      checkEmployeeAvailability(employee, startDate, endDate)
    );

    commit('setIsLoading', {isLoading: false});
    commit('createMonthlyReportData', {
      startDate,
      endDate,
      employees: activeEmployees,
      customers,
      timeRecords: approvedTimeRecords,
      travelRecords: approvedTravelRecords,
      standByRecords: approvedStandByRecords,
      timesheets,
      teams,
    });
  },
};

export default actions;
