import {GetterTree} from 'vuex';

const getters: GetterTree<EmployeesStoreState, RootStoreState> = {
  employeesList(state): Employee[] {
    return state.employees;
  },
  teamList(state): string[] {
    return state.teamList;
  },
};

export default getters;
