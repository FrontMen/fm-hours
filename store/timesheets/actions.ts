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

  async deleteTimesheet({ commit, state }, payload: { timesheetId: string }) {
    if (!payload.timesheetId) return;

    await this.app.$timesheetsService.deleteTimesheet(payload.timesheetId);

    const newTimesheets = state.timesheets.filter(
      (timesheet) => timesheet.id !== payload.timesheetId
    );
    commit("setTimesheets", { timesheets: newTimesheets });
  },
};

export default actions;
