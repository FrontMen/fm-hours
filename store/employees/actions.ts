import { ActionTree } from "vuex";

const actions: ActionTree<EmployeesStoreState, RootStoreState> = {
  async getEmployees({ commit }) {
    const employees = await this.app.$employeesService.getEmployees();
    commit("setEmployees", { employees });
  },

  async toggleActive({ commit }, payload: Employee) {
    const newEmployee = { ...payload, active: !payload.active };
    await this.app.$EmployeesService.updateEmployee(newEmployee);

    commit("updateEmployee", { employee: newEmployee });
  },

  async toggleTravelAllowance({ commit }, payload: Employee) {
    const newEmployee = {
      ...payload,
      travelAllowance: !payload.travelAllowance,
    };
    await this.app.$employeesService.updateEmployee(newEmployee);

    commit("updateEmployee", { employee: newEmployee });
  },

  async saveProjects(
    { commit },
    payload: { employee: Employee; customerIds: string[] }
  ) {
    const newEmployee = { ...payload.employee, projects: payload.customerIds };
    await this.app.$employeesService.updateEmployee(newEmployee);

    commit("updateEmployee", { employee: newEmployee });
  },
};

export default actions;
