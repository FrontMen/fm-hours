/* eslint-disable camelcase */
import { ActionTree } from "vuex";

import { recordStatus } from "~/helpers/record-status";
import {
  getTimeRecordsToSave,
  getTravelRecordsToSave,
  compareTimesheetEmployees,
} from "~/helpers/timesheet";

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

  selectEmployee({ commit }, payload: { employeeId: string }) {
    commit("setSelectedEmployeeId", { employeeId: payload.employeeId });
  },

  async saveTimesheet(
    { state, commit },
    payload: {
      employeeId: string;
      week: WeekDate[];
      timesheet: WeeklyTimesheet;
      status: RecordStatus;
    }
  ) {
    const start = new Date(payload.week[0].date);
    const end = new Date(payload.week[6].date);

    const fetchedEmployeeWeeklyTimesheet = await this.app.$weeklyTimesheetStatusService.getWeeklyTimesheet(
      {
        employeeId: payload.employeeId,
        startDate: start,
      }
    );

    const employeeWeeklyTimesheet: WeeklyTimesheetStatus =
      fetchedEmployeeWeeklyTimesheet ||
      (await this.app.$weeklyTimesheetStatusService.createWeeklyTimesheet({
        employeeId: payload.employeeId,
        startDate: start.getTime(),
        endDate: end.getTime(),
        timeRecordIds: [],
        travelRecordIds: [],
        status: payload.status,
      }));

    const timeRecordsToSave = getTimeRecordsToSave(
      payload.timesheet,
      payload.week,
      payload.status,
      employeeWeeklyTimesheet.id
    );

    const travelRecordsToSave = getTravelRecordsToSave(
      payload.timesheet,
      payload.week,
      payload.status,
      employeeWeeklyTimesheet.id
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
