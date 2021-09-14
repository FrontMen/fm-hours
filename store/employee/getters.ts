import {GetterTree} from 'vuex';

const getters: GetterTree<EmployeeStoreState, RootStoreState> = {
  getEmployee(state): Employee | null {
    return state.employee;
  },

  isEmployeeAdmin(state): boolean {
    return state.isAdmin;
  },
};

export default getters;
