import {GetterTree} from 'vuex';

const getters: GetterTree<EmployeesStoreState, RootStoreState> = {
  employeesList(state): Employee[] {
    return state.employees;
  },
  getEmployeeById: state => (id: string) => {
    return state.employees.find(employee => employee.id === id);
  },
  adminList(state): string[] {
    return state.adminList;
  },
  teamList(state): string[] {
    return state.teamList;
  },
};

export default getters;
