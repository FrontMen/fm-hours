/* eslint-disable camelcase */
import { ActionTree } from "vuex";

import { recordStatus } from "~/helpers/record-status";
import {
  getTimeRecordsToSave,
  getTravelRecordsToSave,
  compareTimesheetEmployees,
  createTimesheetTableData,
} from "~/helpers/timesheet";
import { getWeeksSpan } from "~/helpers/dates";

const isPendingRecord = (
  record: TimeRecord | TravelRecord,
  employeeId: string
) => record.employeeId === employeeId && record.status === recordStatus.PENDING;

const isDeniedRecord = (
  record: TimeRecord | TravelRecord,
  employeeId: string
) => record.employeeId === employeeId && record.status === recordStatus.DENIED;

const actions: ActionTree<TimesheetsStoreState, RootStoreState> = {
  async getEmployeeList({ commit }) {
    const timeRecords = await this.app.$timeRecordsService.getPendingOrDeniedRecords();
    const travelRecords = await this.app.$travelRecordsService.getPendingOrDeniedRecords();

    const employees = await this.app.$employeesService.getEmployees();

    const timesheetEmployees: TimesheetEmployee[] = employees.map(
      (employee) => {
        const pendingTimeRecords = timeRecords.filter((record) =>
          isPendingRecord(record, employee.id)
        );

        const pendingTravelRecords = travelRecords.filter((record) =>
          isPendingRecord(record, employee.id)
        );

        const hasPendingRecords =
          pendingTimeRecords.length > 0 || pendingTravelRecords.length > 0;
        const hasDeniedRecords =
          timeRecords.some((record) => isDeniedRecord(record, employee.id)) ||
          travelRecords.some((record) => isDeniedRecord(record, employee.id));

        return {
          ...employee,
          pendingTimeRecords,
          pendingTravelRecords,
          status: hasPendingRecords
            ? recordStatus.PENDING
            : hasDeniedRecords
            ? recordStatus.DENIED
            : recordStatus.NEW,
        };
      }
    );

    const sortedEmployees = timesheetEmployees.sort(compareTimesheetEmployees);

    commit("setTimesheetEmployees", { employees: sortedEmployees });
  },

  async getTimesheets(
    { commit },
    payload: { startDate: number; endDate: number }
  ) {
    const timesheets = await this.app.$timesheetsService.getTimesheets(
      payload.startDate,
      payload.endDate
    );

    commit("setTimesheets", { timesheets });
  },

  async getTableData(
    { commit },
    payload: {
      weeksBefore: number;
      weeksAfter: number;
    }
  ) {
    const weeksSpan = getWeeksSpan(payload.weeksBefore, payload.weeksAfter);

    const employeesPromise = this.app.$employeesService.getEmployees();
    const timesheetsPromise = this.app.$timesheetsService.getTimesheets(
      weeksSpan[0].start.date,
      weeksSpan[payload.weeksBefore + payload.weeksAfter].start.date
    );

    const [employees, timesheets] = await Promise.all([
      employeesPromise,
      timesheetsPromise,
    ]);

    const tableData = createTimesheetTableData({
      employees,
      timesheets,
      weeksSpan,
    });

    commit("setTimesheetsTableData", { tableData });
  },

  selectEmployee({ commit }, payload: { employeeId: string }) {
    commit("setSelectedEmployeeId", { employeeId: payload.employeeId });
  },

  async saveTimesheet(
    { state, commit },
    payload: {
      employeeId: string;
      week: WeekDate[];
      timesheet: WeeklyTimesheet;
      status: TimesheetStatus;
    }
  ) {
    const timeRecordsToSave = getTimeRecordsToSave(
      payload.timesheet,
      payload.week,
      payload.status
    );

    const travelRecordsToSave = getTravelRecordsToSave(
      payload.timesheet,
      payload.week,
      payload.status
    );

    await this.app.$timeRecordsService.saveEmployeeRecords({
      employeeId: payload.employeeId,
      timeRecords: timeRecordsToSave,
    });

    await this.app.$travelRecordsService.saveEmployeeRecords({
      employeeId: payload.employeeId,
      travelRecords: travelRecordsToSave,
    });

    commit("setTimesheetEmployees", {
      employees: state.employees.map((employee) => {
        if (employee.id !== payload.employeeId) return employee;

        return {
          ...employee,
          pendingTimeRecords: employee.pendingTimeRecords.filter(
            (x) => !timeRecordsToSave.some((y) => y.id === x.id)
          ),
          pendingTravelRecords: employee.pendingTimeRecords.filter(
            (x) => !travelRecordsToSave.some((y) => y.id === x.id)
          ),
        };
      }),
    });
  },
};

export default actions;
