import {ActionTree} from 'vuex/types';

const actions: ActionTree<EmployeesStoreState, RootStoreState> = {
  async getEmployees({commit, getters}) {
    if (getters['employees/employeesList']?.length) return;

    const employees = await this.app.$employeesService.getEmployees();
    commit('setEmployees', {employees});
  },

  async saveProjects(
    {commit},
    payload: {employee: Employee; customerIds: string[]}
  ) {
    const newEmployee = {...payload.employee, projects: payload.customerIds};
    await this.app.$employeesService.updateEmployee(newEmployee);

    commit('updateEmployee', {employee: newEmployee});
  },

  async addNewEmployee({commit}, payload: Omit<Employee, 'id' | 'picture'>) {
    const newEmployee = await this.app.$employeesService.createEmployee(
      payload
    );
    commit('addNewEmployeeSuccess', {employee: newEmployee});
  },

  async updateEmployee({commit}, payload: Employee) {
    await this.app.$employeesService.updateEmployee(payload);
    commit('updateEmployee', {employee: payload});
  },

  async getAdminList({commit, getters}) {
    if (getters['employees/adminList']?.length) return;

    const adminList = await this.app.$employeesService.getAdminEmails();
    commit('setAdminList', adminList);
  },

  async getTeamList({commit, getters}) {
    if (getters['employees/teamList']?.length) return;

    const teamList = await this.app.$employeesService.getTeams();
    commit('setTeamList', teamList);
  },

  async updateAdminList({commit}, payload: string[]) {
    const adminList = await this.app.$employeesService.updateAdminEmails(
      payload
    );
    commit('setAdminList', adminList);
  },
};

export default actions;
