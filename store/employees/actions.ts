import { ActionTree } from "vuex";
import EmployeesService from "~/services/employees-service";

const actions: ActionTree<EmployeesStoreState, RootStoreState> = {
  async getEmployees({ commit }) {
    const employees = await this.app.$employeesService.getEmployees();
    commit("setEmployees", { employees });
  },

  async saveProjects(
    { commit },
    payload: { employee: Employee; customerIds: string[] }
  ) {
    const newEmployee = { ...payload.employee, projects: payload.customerIds };
    await this.app.$employeesService.updateEmployee(newEmployee);

    commit("updateEmployee", { employee: newEmployee });
  },

  async addNewEmployee(
    { commit },
    payload: {
      name: string;
      email: string;
      travelAllowance: boolean;
      startDate: number;
    }
  ) {
    const newEmployee = await this.app.$employeesService.createEmployee(
      payload
    );
    commit("addNewEmployeeSuccess", { employee: newEmployee });
  },

  async updateEmployee({ commit }, payload: Employee) {
    await this.app.$employeesService.updateEmployee(payload);
    commit("updateEmployee", { employee: payload });
  },

  async getAdminList({commit, getters }) {
    if (getters["employees/adminList"].length) return; // TODO Vlad maybe move to service?

    const employeesService = new EmployeesService(this.$fire);
    const adminList = await employeesService.getAdminEmails();
    commit("setAdminList", adminList);
  },
};

export default actions;
