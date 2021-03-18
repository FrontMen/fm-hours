import { startOfMonth, lastDayOfMonth } from "date-fns";
import { ActionTree } from "vuex";

const actions: ActionTree<ReportsStoreState, RootStoreState> = {
  async getMonthlyReportData({ commit }, payload: { startDate: Date }) {
    commit("setIsLoading", { isLoading: true });

    const startDate = startOfMonth(payload.startDate);
    const endDate = lastDayOfMonth(payload.startDate);
    const users = await this.app.$usersService.getUsers(); // TODO: should filter on `active` users

    const timeRecords = await this.app.$timeRecordsService.getApprovedRecords({
      startDate,
      endDate,
    });

    const travelRecords = await this.app.$timeRecordsService.getApprovedRecords(
      {
        startDate,
        endDate,
      }
    );

    commit("createMonthlyReportData", { users, timeRecords, travelRecords });
    commit("setIsLoading", { isLoading: false });
  },
};

export default actions;
