import { startOfMonth, lastDayOfMonth } from "date-fns";
import { ActionTree } from "vuex";

const actions: ActionTree<ReportsStoreState, RootStoreState> = {
  async getMonthlyReport({ commit }, payload: { startDate: Date }) {
    commit("setIsLoading", { isLoading: true });

    const startDate = startOfMonth(payload.startDate);
    const endDate = lastDayOfMonth(payload.startDate);

    const users = await this.app.$usersService.getUsers();
    const timeRecords = await this.app.$timeRecordsService.getApprovedRecords({
      startDate,
      endDate,
    });

    commit("createMonthlyReport", { users, timeRecords });
    commit("setIsLoading", { isLoading: false });
  },
};

export default actions;
