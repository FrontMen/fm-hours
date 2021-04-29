import { startOfMonth, lastDayOfMonth, isBefore } from "date-fns";
import { ActionTree } from "vuex";

const actions: ActionTree<ReportsStoreState, RootStoreState> = {
  async getMonthlyReportData({ commit }, payload: { startDate: Date }) {
    commit("setIsLoading", { isLoading: true });

    const startDate = startOfMonth(payload.startDate);
    const endDate = lastDayOfMonth(payload.startDate);

    const customers = await this.app.$customersService.getCustomers();
    const employees: Employee[] = await this.app.$employeesService.getEmployees();
    const activeEmployees = employees.filter(
      (employee) =>
        !employee.endDate || !isBefore(new Date(employee.endDate), startDate)
    );

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
      employees: activeEmployees,
      customers,
      timeRecords,
      travelRecords,
    });
  },
};

export default actions;
