import {ActionTree} from 'vuex/types';

const actions: ActionTree<EmployeesStoreState, RootStoreState> = {
  async get({commit, rootState}) {
    if (rootState.employees.employees?.length) return;

    const employees = await this.app.$employeesService.getAll();
    commit('set', {employees});
  },

  async add({commit}, payload: Omit<Employee, 'id'>) {
    const newEmployee = await this.app.$employeesService.add(payload);
    commit('add', {employee: newEmployee});
  },

  async update({commit}, payload: Employee) {
    await this.app.$employeesService.update(payload);
    commit('update', {employee: payload});
  },
};

export default actions;
