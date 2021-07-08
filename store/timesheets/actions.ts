/* eslint-disable camelcase */
import { ActionTree } from "vuex";

import { createTimesheetTableData } from "~/helpers/timesheet";
import { getWeeksSpan } from "~/helpers/dates";

const actions: ActionTree<TimesheetsStoreState, RootStoreState> = {
  async getTimesheets(
    { commit },
    payload: {
      startDate?: number;
      endDate?: number;
      employeeId?: string;
      date?: number;
    }
  ) {
    const timesheets = await this.app.$timesheetsService.getTimesheets(payload);

    commit("setTimesheets", { timesheets });
  },

  /**
   * Action similar to #getTimesheets, but expects to store 1 single timesheet to a different point in store.
   * Used in copying previous week, to perpetuate the comment. Payload params mandatory for accuracy in search.
   */
  async getPreviousTimesheet(
    { commit },
    payload: {
      startDate: number;
      endDate: number;
      employeeId: string;
    }
  ) {
    const timesheets = await this.app.$timesheetsService.getTimesheets(payload);
    commit("setPreviousTimesheet", { timesheet: timesheets[0] });
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
    const timesheetsPromise = this.app.$timesheetsService.getTimesheets({
      startDate: new Date(weeksSpan[0].start.ISO).getTime(),
      endDate: new Date(
        weeksSpan[payload.weeksBefore + payload.weeksAfter].start.ISO
      ).getTime(),
    });

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

  async saveTimesheet({ commit }, payload: Optional<Timesheet, "id">) {
    const timesheet = await this.app.$timesheetsService.saveTimesheet(payload);
    commit("setTimesheets", { timesheets: [timesheet] });
  },

  async denyTimesheet(
    { commit },
    payload: { timesheet: Optional<Timesheet, "id">; emailData: EmailData }
  ) {
    await this.app.$mailService.sendMail(payload.emailData);
    const timesheet = await this.app.$timesheetsService.saveTimesheet(
      payload.timesheet
    );

    commit("setTimesheets", { timesheets: [timesheet] });
  },
};

export default actions;
