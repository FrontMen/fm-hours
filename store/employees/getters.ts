import {GetterTree} from 'vuex';

const getters: GetterTree<EmployeesStoreState, RootStoreState> = {
  employeesList(state): Employee[] {
    return state.employees;
  },
  adminList(state): string[] {
    return state.adminList;
  },
};

export default getters;
