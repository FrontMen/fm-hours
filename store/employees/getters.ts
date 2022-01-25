import {GetterTree} from 'vuex';

const getters: GetterTree<EmployeesStoreState, RootStoreState> = {
  employeeById(state): (employeeId: string) => Employee | undefined {
    return (employeeId: string) =>
      state.employees.find((employee: Employee) => employee.id === employeeId);
  },
  employeesList(state): Employee[] {
    return state.employees;
  },
  adminList(state): string[] {
    return state.adminList;
  },
  teamList(state): string[] {
    return state.teamList;
  },
};

export default getters;
