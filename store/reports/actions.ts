import { startOfMonth, lastDayOfMonth } from "date-fns";
import { ActionTree } from "vuex";

const actions: ActionTree<ReportsStoreState, RootStoreState> = {
  async getMonthlyReportData({ commit }, payload: { startDate: Date }) {
    commit("setIsLoading", { isLoading: true });

    const startDate = startOfMonth(payload.startDate);
    const endDate = lastDayOfMonth(payload.startDate);

    const customers = await this.app.$customersService.getCustomers();
    const users = await this.app.$usersService.getUsers(); // TODO: should filter on `active` users

    const timeRecords = await this.app.$timeRecordsService.getApprovedRecords({
      startDate,
      endDate,
    });

    const travelRecords = await this.app.$travelRecordsService.getApprovedRecords(
      {
        startDate,
        endDate,
      }
    );

    commit("setIsLoading", { isLoading: false });
    commit("createMonthlyReportData", {
      users,
      customers,
      timeRecords,
      travelRecords,
    });
  },
};

export default actions;
